import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InspectionService } from '../services/inspection.service';
import { Inspection } from '../entities/inspection.entity';
import { Media } from '../entities/media.entity';
import { CreateInspectionInput, UpdateInspectionInput } from '../dto/repair.input';
import { InspectionType } from '../enums/repair.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/user.entity';

@Resolver(() => Inspection)
@UseGuards(JwtAuthGuard)
export class InspectionResolver {
  constructor(private inspectionService: InspectionService) {}

  @Mutation(() => Inspection)
  async createInspection(
    @Args('input') input: CreateInspectionInput,
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<Inspection> {
    return this.inspectionService.create(input, businessId);
  }

  @Query(() => [Inspection])
  async inspections(
    @Args('repairSessionId', { type: () => ID }) repairSessionId: number,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Inspection[]> {
    return this.inspectionService.findAll(repairSessionId, businessId);
  }

  @Query(() => Inspection)
  async inspection(
    @Args('id', { type: () => ID }) id: number,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Inspection> {
    return this.inspectionService.findOne(id, businessId);
  }

  @Query(() => [Inspection])
  async inspectionsByType(
    @Args('repairSessionId', { type: () => ID }) repairSessionId: number,
    @Args('type', { type: () => InspectionType }) type: InspectionType,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Inspection[]> {
    return this.inspectionService.getInspectionsByType(repairSessionId, type, businessId);
  }

  @Mutation(() => Inspection)
  async updateInspection(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') input: UpdateInspectionInput,
    @Args('businessId', { type: () => ID, nullable: true }) businessId: number,
    @CurrentUser() user?: User,
  ): Promise<Inspection> {
    const effectiveBusinessId = businessId || user?.businessId;
    if (!effectiveBusinessId) {
      throw new Error('Business ID is required');
    }
    return this.inspectionService.update(id, input, effectiveBusinessId);
  }

  @Mutation(() => Media)
  async addInspectionMedia(
    @Args('inspectionId', { type: () => ID }) inspectionId: number,
    @Args('base64File') base64File: string,
    @Args('filename') filename: string,
    @Args('mimetype') mimetype: string,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Media> {
    return this.inspectionService.addMediaFromBase64(
      inspectionId,
      base64File,
      filename,
      mimetype,
      businessId
    );
  }

  @Query(() => String, { name: 'inspectionStatistics' })
  async getInspectionStatistics(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<string> {
    const stats = await this.inspectionService.getStatistics(businessId);
    return JSON.stringify(stats);
  }
}