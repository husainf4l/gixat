import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerCommunicationLog } from './entities/customer-communication-log.entity';
import { CustomerPreference } from './entities/customer-preference.entity';
import { LoyaltyTransaction, LoyaltyTransactionType } from './entities/loyalty-transaction.entity';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';
import { CustomerFilterInput, CustomerSortInput } from './dto/customer-filter.input';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(CustomerCommunicationLog)
    private communicationLogRepository: Repository<CustomerCommunicationLog>,
    @InjectRepository(CustomerPreference)
    private preferenceRepository: Repository<CustomerPreference>,
    @InjectRepository(LoyaltyTransaction)
    private loyaltyTransactionRepository: Repository<LoyaltyTransaction>,
  ) {}

  async create(createCustomerInput: CreateCustomerInput, businessId: number): Promise<Customer> {
    // Check for existing email within the business
    const existingCustomer = await this.customerRepository.findOne({
      where: { email: createCustomerInput.email, businessId },
    });

    if (existingCustomer) {
      throw new BadRequestException('Customer with this email already exists');
    }

    // Generate customer number
    const customerNumber = await this.generateCustomerNumber(businessId);

    const customerData = {
      ...createCustomerInput,
      businessId,
      customerNumber,
      dateOfBirth: createCustomerInput.dateOfBirth ? new Date(createCustomerInput.dateOfBirth) : undefined,
      insuranceExpiryDate: createCustomerInput.insuranceExpiryDate ? new Date(createCustomerInput.insuranceExpiryDate) : undefined,
    };

    const customer = this.customerRepository.create(customerData);
    return this.customerRepository.save(customer);
  }

  async findAll(
    businessId: number,
    filter?: CustomerFilterInput,
    sort?: CustomerSortInput,
    limit = 50,
    offset = 0,
  ): Promise<{ customers: Customer[]; total: number }> {
    const queryBuilder = this.customerRepository.createQueryBuilder('customer')
      .where('customer.businessId = :businessId', { businessId });

    this.applyFilters(queryBuilder, filter);
    this.applySorting(queryBuilder, sort);

    const [customers, total] = await queryBuilder
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { customers, total };
  }

  async findOne(id: number, businessId: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id, businessId },
      relations: ['cars', 'communicationLogs', 'preferences', 'loyaltyTransactions'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: number, updateCustomerInput: UpdateCustomerInput, businessId: number): Promise<Customer> {
    const customer = await this.findOne(id, businessId);

    // Check for email conflicts if email is being updated
    if (updateCustomerInput.email && updateCustomerInput.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: updateCustomerInput.email, businessId },
      });

      if (existingCustomer) {
        throw new BadRequestException('Customer with this email already exists');
      }
    }

    const updateData = {
      ...updateCustomerInput,
      dateOfBirth: updateCustomerInput.dateOfBirth ? new Date(updateCustomerInput.dateOfBirth) : undefined,
      insuranceExpiryDate: updateCustomerInput.insuranceExpiryDate ? new Date(updateCustomerInput.insuranceExpiryDate) : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await this.customerRepository.update(id, updateData);
    return this.findOne(id, businessId);
  }

  async remove(id: number, businessId: number): Promise<boolean> {
    const customer = await this.findOne(id, businessId);
    await this.customerRepository.remove(customer);
    return true;
  }

  // Loyalty Points Management
  async addLoyaltyPoints(
    customerId: number,
    points: number,
    reason: string,
    businessId: number,
    createdById?: number,
    relatedEntityType?: string,
    relatedEntityId?: number,
  ): Promise<Customer> {
    const customer = await this.findOne(customerId, businessId);
    const balanceBefore = customer.loyaltyPoints;
    const balanceAfter = balanceBefore + points;

    // Create loyalty transaction
    const transaction = this.loyaltyTransactionRepository.create({
      customerId,
      type: LoyaltyTransactionType.EARNED,
      points,
      balanceBefore,
      balanceAfter,
      reason,
      relatedEntityType,
      relatedEntityId,
      createdById,
    });

    await this.loyaltyTransactionRepository.save(transaction);

    // Update customer balance
    await this.customerRepository.update(customerId, {
      loyaltyPoints: balanceAfter,
    });

    return this.findOne(customerId, businessId);
  }

  async redeemLoyaltyPoints(
    customerId: number,
    points: number,
    reason: string,
    businessId: number,
    createdById?: number,
  ): Promise<Customer> {
    const customer = await this.findOne(customerId, businessId);
    
    if (customer.loyaltyPoints < points) {
      throw new BadRequestException('Insufficient loyalty points');
    }

    const balanceBefore = customer.loyaltyPoints;
    const balanceAfter = balanceBefore - points;

    // Create loyalty transaction
    const transaction = this.loyaltyTransactionRepository.create({
      customerId,
      type: LoyaltyTransactionType.REDEEMED,
      points: -points,
      balanceBefore,
      balanceAfter,
      reason,
      createdById,
    });

    await this.loyaltyTransactionRepository.save(transaction);

    // Update customer balance
    await this.customerRepository.update(customerId, {
      loyaltyPoints: balanceAfter,
    });

    return this.findOne(customerId, businessId);
  }

  // Customer Preferences
  async setPreference(
    customerId: number,
    category: string,
    key: string,
    value: string,
    businessId: number,
    description?: string,
  ): Promise<CustomerPreference> {
    // Verify customer belongs to business
    await this.findOne(customerId, businessId);

    // Check if preference already exists
    let preference = await this.preferenceRepository.findOne({
      where: { customerId, category, key },
    });

    if (preference) {
      preference.value = value;
      if (description !== undefined) {
        preference.description = description;
      }
      preference.isActive = true;
    } else {
      preference = this.preferenceRepository.create({
        customerId,
        category,
        key,
        value,
        description,
      });
    }

    return this.preferenceRepository.save(preference);
  }

  async getPreferences(customerId: number, businessId: number, category?: string): Promise<CustomerPreference[]> {
    // Verify customer belongs to business
    await this.findOne(customerId, businessId);

    const query = this.preferenceRepository.createQueryBuilder('pref')
      .where('pref.customerId = :customerId', { customerId })
      .andWhere('pref.isActive = true');

    if (category) {
      query.andWhere('pref.category = :category', { category });
    }

    return query.getMany();
  }

  // Communication Logs
  async addCommunicationLog(
    customerId: number,
    logData: Partial<CustomerCommunicationLog>,
    businessId: number,
  ): Promise<CustomerCommunicationLog> {
    // Verify customer belongs to business
    await this.findOne(customerId, businessId);

    const log = this.communicationLogRepository.create({
      ...logData,
      customerId,
    });

    return this.communicationLogRepository.save(log);
  }

  async getCommunicationLogs(
    customerId: number,
    businessId: number,
    limit = 50,
    offset = 0,
  ): Promise<{ logs: CustomerCommunicationLog[]; total: number }> {
    // Verify customer belongs to business
    await this.findOne(customerId, businessId);

    const [logs, total] = await this.communicationLogRepository.findAndCount({
      where: { customerId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['createdBy'],
    });

    return { logs, total };
  }

  // Service History and Stats
  async updateVisitStats(customerId: number, businessId: number, totalAmount?: number): Promise<void> {
    const customer = await this.findOne(customerId, businessId);
    
    const updates: Partial<Customer> = {
      visitCount: customer.visitCount + 1,
      lastVisitDate: new Date(),
    };

    if (totalAmount) {
      updates.totalSpent = customer.totalSpent + totalAmount;
    }

    await this.customerRepository.update(customerId, updates);
  }

  // Private helper methods
  private async generateCustomerNumber(businessId: number): Promise<string> {
    const count = await this.customerRepository.count({ where: { businessId } });
    return `CUST-${businessId}-${(count + 1).toString().padStart(6, '0')}`;
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<Customer>, filter?: CustomerFilterInput): void {
    if (!filter) return;

    if (filter.search) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search OR customer.phone ILIKE :search OR customer.companyName ILIKE :search)',
        { search: `%${filter.search}%` }
      );
    }

    if (filter.customerType) {
      queryBuilder.andWhere('customer.customerType = :customerType', { customerType: filter.customerType });
    }

    if (filter.status) {
      queryBuilder.andWhere('customer.status = :status', { status: filter.status });
    }

    if (filter.city) {
      queryBuilder.andWhere('customer.city ILIKE :city', { city: `%${filter.city}%` });
    }

    if (filter.state) {
      queryBuilder.andWhere('customer.state ILIKE :state', { state: `%${filter.state}%` });
    }

    if (filter.isVip !== undefined) {
      if (filter.isVip) {
        queryBuilder.andWhere('(customer.status = :vipStatus OR customer.totalSpent > :vipThreshold)', {
          vipStatus: 'vip',
          vipThreshold: 10000,
        });
      } else {
        queryBuilder.andWhere('customer.status != :vipStatus AND customer.totalSpent <= :vipThreshold', {
          vipStatus: 'vip',
          vipThreshold: 10000,
        });
      }
    }

    if (filter.minTotalSpent !== undefined) {
      queryBuilder.andWhere('customer.totalSpent >= :minSpent', { minSpent: filter.minTotalSpent });
    }

    if (filter.maxTotalSpent !== undefined) {
      queryBuilder.andWhere('customer.totalSpent <= :maxSpent', { maxSpent: filter.maxTotalSpent });
    }

    if (filter.minVisitCount !== undefined) {
      queryBuilder.andWhere('customer.visitCount >= :minVisits', { minVisits: filter.minVisitCount });
    }

    if (filter.tags && filter.tags.length > 0) {
      queryBuilder.andWhere('customer.tags && :tags', { tags: filter.tags });
    }
  }

  private applySorting(queryBuilder: SelectQueryBuilder<Customer>, sort?: CustomerSortInput): void {
    if (!sort || !sort.field) {
      queryBuilder.orderBy('customer.createdAt', 'DESC');
      return;
    }

    const order = sort.order || 'ASC';
    
    switch (sort.field) {
      case 'name':
        queryBuilder.orderBy('customer.firstName', order).addOrderBy('customer.lastName', order);
        break;
      case 'email':
        queryBuilder.orderBy('customer.email', order);
        break;
      case 'totalSpent':
        queryBuilder.orderBy('customer.totalSpent', order);
        break;
      case 'visitCount':
        queryBuilder.orderBy('customer.visitCount', order);
        break;
      case 'lastVisit':
        queryBuilder.orderBy('customer.lastVisitDate', order);
        break;
      case 'createdAt':
        queryBuilder.orderBy('customer.createdAt', order);
        break;
      default:
        queryBuilder.orderBy(`customer.${sort.field}`, order);
    }
  }
}