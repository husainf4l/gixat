import { Resolver, Query, Mutation, Args, Int, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from './entities/customer.entity';
import { CustomerCommunicationLog } from './entities/customer-communication-log.entity';
import { CustomerPreference } from './entities/customer-preference.entity';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';
import { CustomerFilterInput, CustomerSortInput } from './dto/customer-filter.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Customer)
@UseGuards(JwtAuthGuard)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Mutation(() => Customer)
  async createCustomer(
    @Args('createCustomerInput') createCustomerInput: CreateCustomerInput,
    @Context() context: any,
  ): Promise<Customer> {
    const businessId = context.req.user.businessId;
    return this.customerService.create(createCustomerInput, businessId);
  }

  @Query(() => [Customer], { name: 'customers' })
  async findAllCustomers(
    @Args('filter', { nullable: true }) filter?: CustomerFilterInput,
    @Args('sort', { nullable: true }) sort?: CustomerSortInput,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Context() context?: any,
  ): Promise<Customer[]> {
    const businessId = context.req.user.businessId;
    const result = await this.customerService.findAll(businessId, filter, sort, limit, offset);
    return result.customers;
  }

  @Query(() => Customer, { name: 'customer' })
  async findOneCustomer(
    @Args('id', { type: () => ID }) id: number,
    @Context() context: any,
  ): Promise<Customer> {
    const businessId = context.req.user.businessId;
    return this.customerService.findOne(id, businessId);
  }

  @Mutation(() => Customer)
  async updateCustomer(
    @Args('id', { type: () => ID }) id: number,
    @Args('updateCustomerInput') updateCustomerInput: UpdateCustomerInput,
    @Context() context: any,
  ): Promise<Customer> {
    const businessId = context.req.user.businessId;
    return this.customerService.update(id, updateCustomerInput, businessId);
  }

  @Mutation(() => Boolean)
  async removeCustomer(
    @Args('id', { type: () => ID }) id: number,
    @Context() context: any,
  ): Promise<boolean> {
    const businessId = context.req.user.businessId;
    return this.customerService.remove(id, businessId);
  }

  // Loyalty Points Mutations
  @Mutation(() => Customer)
  async addLoyaltyPoints(
    @Args('customerId', { type: () => ID }) customerId: number,
    @Args('points', { type: () => Int }) points: number,
    @Args('reason') reason: string,
    @Args('relatedEntityType', { nullable: true }) relatedEntityType?: string,
    @Args('relatedEntityId', { type: () => ID, nullable: true }) relatedEntityId?: number,
    @Context() context?: any,
  ): Promise<Customer> {
    const businessId = context.req.user.businessId;
    const userId = context.req.user.sub;
    return this.customerService.addLoyaltyPoints(
      customerId,
      points,
      reason,
      businessId,
      userId,
      relatedEntityType,
      relatedEntityId,
    );
  }

  @Mutation(() => Customer)
  async redeemLoyaltyPoints(
    @Args('customerId', { type: () => ID }) customerId: number,
    @Args('points', { type: () => Int }) points: number,
    @Args('reason') reason: string,
    @Context() context: any,
  ): Promise<Customer> {
    const businessId = context.req.user.businessId;
    const userId = context.req.user.sub;
    return this.customerService.redeemLoyaltyPoints(customerId, points, reason, businessId, userId);
  }

  // Preferences
  @Mutation(() => CustomerPreference)
  async setCustomerPreference(
    @Args('customerId', { type: () => ID }) customerId: number,
    @Args('category') category: string,
    @Args('key') key: string,
    @Args('value') value: string,
    @Args('description', { nullable: true }) description?: string,
    @Context() context?: any,
  ): Promise<CustomerPreference> {
    const businessId = context.req.user.businessId;
    return this.customerService.setPreference(customerId, category, key, value, businessId, description);
  }

  @Query(() => [CustomerPreference])
  async getCustomerPreferences(
    @Args('customerId', { type: () => ID }) customerId: number,
    @Args('category', { nullable: true }) category?: string,
    @Context() context?: any,
  ): Promise<CustomerPreference[]> {
    const businessId = context.req.user.businessId;
    return this.customerService.getPreferences(customerId, businessId, category);
  }

  // Communication Logs
  @Query(() => [CustomerCommunicationLog])
  async getCustomerCommunicationLogs(
    @Args('customerId', { type: () => ID }) customerId: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Context() context?: any,
  ): Promise<CustomerCommunicationLog[]> {
    const businessId = context.req.user.businessId;
    const result = await this.customerService.getCommunicationLogs(customerId, businessId, limit, offset);
    return result.logs;
  }

  // Visit Stats Update
  @Mutation(() => Boolean)
  async updateCustomerVisitStats(
    @Args('customerId', { type: () => ID }) customerId: number,
    @Args('totalAmount', { type: () => Int, nullable: true }) totalAmount?: number,
    @Context() context?: any,
  ): Promise<boolean> {
    const businessId = context.req.user.businessId;
    await this.customerService.updateVisitStats(customerId, businessId, totalAmount);
    return true;
  }
}