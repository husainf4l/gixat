import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Business } from '../entities/business.entity';
import { BusinessService } from '../services/business.service';
import { CreateBusinessInput, UpdateBusinessInput, GarageSettingsInput } from '../dto/business.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/user.entity';

@Resolver(() => Business)
export class BusinessResolver {
  constructor(private businessService: BusinessService) {}

  @Query(() => [Business])
  async businesses(): Promise<Business[]> {
    return this.businessService.findAll();
  }

  @Query(() => Business, { nullable: true })
  async business(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Business | null> {
    return this.businessService.findById(id);
  }

  @Query(() => [Business])
  @UseGuards(JwtAuthGuard)
  async myGarages(@CurrentUser() user: User): Promise<Business[]> {
    return this.businessService.findByOwnerId(user.id);
  }

  @Mutation(() => Business)
  @UseGuards(JwtAuthGuard)
  async createGarage(
    @Args('input') input: CreateBusinessInput,
    @CurrentUser() user: User,
  ): Promise<Business> {
    return this.businessService.create(input, user.id);
  }

  @Mutation(() => Business, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async addUserToGarage(
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('userId', { type: () => ID }) userId: number,
  ): Promise<Business | null> {
    return this.businessService.addUserToBusiness(businessId, userId);
  }

  @Mutation(() => Business, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async removeUserFromGarage(
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('userId', { type: () => ID }) userId: number,
  ): Promise<Business | null> {
    return this.businessService.removeUserFromBusiness(businessId, userId);
  }

  @Mutation(() => Business)
  @UseGuards(JwtAuthGuard)
  async updateGarage(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') input: UpdateBusinessInput,
  ): Promise<Business | null> {
    return this.businessService.update(id, input);
  }

  @Mutation(() => Business)
  @UseGuards(JwtAuthGuard)
  async updateGarageSettings(
    @Args('id', { type: () => ID }) id: number,
    @Args('settings') settings: GarageSettingsInput,
  ): Promise<Business | null> {
    return this.businessService.updateGarageSettings(id, settings);
  }

  @Query(() => String, { name: 'garageCapacity' })
  @UseGuards(JwtAuthGuard)
  async getGarageCapacity(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<string> {
    const capacity = await this.businessService.getGarageCapacity(id);
    return JSON.stringify(capacity);
  }

  @Query(() => String, { name: 'garageStatistics' })
  @UseGuards(JwtAuthGuard)
  async getGarageStatistics(
    @Args('id', { type: () => ID }) id: number,
  ): Promise<string> {
    const stats = await this.businessService.getGarageStatistics(id);
    return JSON.stringify(stats);
  }
}
