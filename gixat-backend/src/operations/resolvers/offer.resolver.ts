import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OfferService } from '../services/offer.service';
import { Offer } from '../entities/offer.entity';
import { OfferItem } from '../entities/offer-item.entity';
import { CreateOfferInput, CreateOfferItemInput } from '../dto/repair.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/user.entity';

@Resolver(() => Offer)
@UseGuards(JwtAuthGuard)
export class OfferResolver {
  constructor(private offerService: OfferService) {}

  @Mutation(() => Offer)
  async createOffer(
    @Args('input') input: CreateOfferInput,
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<Offer> {
    return this.offerService.create(input, businessId);
  }

  @Mutation(() => OfferItem)
  async addOfferItem(
    @Args('offerId', { type: () => ID }) offerId: number,
    @Args('input') input: CreateOfferItemInput,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<OfferItem> {
    return this.offerService.addItem(offerId, input, businessId);
  }

  @Query(() => [Offer])
  async offers(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Offer[]> {
    return this.offerService.findAll(businessId);
  }

  @Query(() => Offer)
  async offer(
    @Args('id', { type: () => ID }) id: number,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Offer> {
    return this.offerService.findOne(id, businessId);
  }

  @Mutation(() => Offer)
  async approveOffer(
    @Args('id', { type: () => ID }) id: number,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Offer> {
    return this.offerService.approve(id, businessId);
  }

  @Mutation(() => Offer)
  async rejectOffer(
    @Args('id', { type: () => ID }) id: number,
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('reason', { nullable: true }) reason?: string,
  ): Promise<Offer> {
    return this.offerService.reject(id, businessId, reason);
  }

  @Query(() => String, { name: 'offerStatistics' })
  async getOfferStatistics(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<string> {
    const stats = await this.offerService.getStatistics(businessId);
    return JSON.stringify(stats);
  }
}