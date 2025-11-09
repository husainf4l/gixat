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
    return this.repairSessionService.create(input, user.id);
  }

  @Query(() => [RepairSession])
  async repairSessions(
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ): Promise<RepairSession[]> {
    const options = limit ? { take: limit, skip: offset || 0 } : undefined;
    return this.repairSessionService.findAll(businessId, options);
  }

  @Query(() => RepairSession)
  async repairSession(
    @Args('id', { type: () => ID }) id: number,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<RepairSession> {
    return this.repairSessionService.findOne(id, businessId);
  }

  @Mutation(() => RepairSession)
  async updateRepairSessionStatus(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') input: UpdateRepairSessionStatusInput,
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<RepairSession> {
    return this.repairSessionService.updateStatus(id, input, businessId, user.id);
  }

  @Query(() => String, { name: 'repairSessionStatistics' })
  async getRepairSessionStatistics(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<string> {
    const stats = await this.repairSessionService.getStatistics(businessId);
    return JSON.stringify(stats);
  }
}