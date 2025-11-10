import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../entities/business.entity';
import { User } from '../../user/user.entity';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find({
      where: { isActive: true },
      relations: ['owner', 'users'],
    });
  }

  async findById(id: number): Promise<Business | null> {
    return this.businessRepository.findOne({
      where: { id },
      relations: ['owner', 'userBusinesses', 'users'],
    });
  }

  async findByOwnerId(ownerId: number): Promise<Business[]> {
    return this.businessRepository.find({
      where: { ownerId, isActive: true },
      relations: ['users'],
    });
  }

  async create(businessData: Partial<Business>, ownerId: number): Promise<Business> {
    // Check if user already has a business
    const existingBusiness = await this.businessRepository.findOne({
      where: { ownerId },
    });

    if (existingBusiness) {
      throw new ConflictException('User already owns a garage');
    }

    const business = this.businessRepository.create({
      ...businessData,
      ownerId,
    });
    const savedBusiness = await this.businessRepository.save(business);

    // Assign the owner to this business
    await this.userRepository.update(ownerId, { businessId: savedBusiness.id });

    return savedBusiness;
  }

  async addUserToBusiness(businessId: number, userId: number): Promise<Business | null> {
    // Check if user already has a business
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.businessId) {
      throw new ConflictException('User already belongs to a garage');
    }

    // Assign user to business
    await this.userRepository.update(userId, { businessId });

    return this.findById(businessId);
  }

  async removeUserFromBusiness(businessId: number, userId: number): Promise<Business | null> {
    const business = await this.findById(businessId);
    
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Prevent removing the owner
    if (business.ownerId === userId) {
      throw new ConflictException('Cannot remove the owner from the garage');
    }

    await this.userRepository.update(userId, { businessId: undefined });

    return this.findById(businessId);
  }

  async update(id: number, businessData: Partial<Business>): Promise<Business | null> {
    await this.businessRepository.update(id, businessData);
    return this.findById(id);
  }

  // Garage-specific methods
  async getGarageCapacity(businessId: number): Promise<{ current: number; max: number }> {
    const business = await this.findById(businessId);
    // TODO: Calculate current capacity from active repair sessions
    return {
      current: 0, // Will be calculated from active jobs
      max: business?.maxCapacity || 10, // Default capacity
    };
  }

  async updateGarageSettings(
    businessId: number, 
    settings: {
      maxCapacity?: number;
      workingHours?: string;
      servicesOffered?: string;
      licenseNumber?: string;
      taxId?: string;
    }
  ): Promise<Business | null> {
    await this.businessRepository.update(businessId, settings);
    return this.findById(businessId);
  }

  async getGarageStatistics(businessId: number): Promise<any> {
    // TODO: Aggregate statistics from repair sessions, clients, etc.
    return {
      totalClients: 0,
      activeSessions: 0,
      completedThisMonth: 0,
      revenue: 0,
    };
  }
}
