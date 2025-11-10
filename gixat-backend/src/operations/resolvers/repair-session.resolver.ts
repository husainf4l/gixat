import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RepairSessionService } from '../services/repair-session.service';
import { RepairSession } from '../entities/repair-session.entity';
import { CreateRepairSessionInput, UpdateRepairSessionStatusInput } from '../dto/repair.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/user.entity';

@Resolver(() => RepairSession)
@UseGuards(JwtAuthGuard)
export class RepairSessionResolver {
  constructor(private repairSessionService: RepairSessionService) {}

  @Mutation(() => RepairSession)
  async createRepairSession(
    @Args('input') input: CreateRepairSessionInput,
    @CurrentUser() user: User,
  ): Promise<RepairSession> {
    if (!user.businessId) {
      throw new Error('User is not associated with any garage/business. Please create or join a garage first.');
    }
    return this.repairSessionService.create(input, user.id, user.businessId);
  }

  @Query(() => [RepairSession])
  async repairSessions(
    @Args('businessId', { type: () => ID, nullable: true }) businessId: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @CurrentUser() user?: User,
  ): Promise<RepairSession[]> {
    const effectiveBusinessId = businessId || user?.businessId;
    if (!effectiveBusinessId) {
      throw new Error('Business ID is required');
    }
    const options = limit ? { take: limit, skip: offset || 0 } : undefined;
    return this.repairSessionService.findAll(effectiveBusinessId, options);
  }

  @Query(() => RepairSession)
  async repairSession(
    @Args('id', { type: () => ID }) id: number,
    @Args('businessId', { type: () => ID, nullable: true }) businessId: number,
    @CurrentUser() user?: User,
  ): Promise<RepairSession> {
    const effectiveBusinessId = businessId || user?.businessId;
    if (!effectiveBusinessId) {
      throw new Error('Business ID is required');
    }
    return this.repairSessionService.findOne(id, effectiveBusinessId);
  }

  @Mutation(() => RepairSession)
  async updateRepairSessionStatus(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') input: UpdateRepairSessionStatusInput,
    @Args('businessId', { type: () => ID, nullable: true }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<RepairSession> {
    const effectiveBusinessId = businessId || user.businessId;
    if (!effectiveBusinessId) {
      throw new Error('Business ID is required');
    }
    return this.repairSessionService.updateStatus(id, input, effectiveBusinessId, user.id);
  }

  @Query(() => String, { name: 'repairSessionStatistics' })
  async getRepairSessionStatistics(
    @Args('businessId', { type: () => ID, nullable: true }) businessId: number,
    @CurrentUser() user?: User,
  ): Promise<string> {
    const effectiveBusinessId = businessId || user?.businessId;
    if (!effectiveBusinessId) {
      throw new Error('Business ID is required');
    }
    const stats = await this.repairSessionService.getStatistics(effectiveBusinessId);
    return JSON.stringify(stats);
  }
}