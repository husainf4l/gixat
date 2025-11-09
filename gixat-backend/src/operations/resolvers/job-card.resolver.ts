import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JobCardService } from '../services/job-card.service';
import { JobCard } from '../entities/job-card.entity';
import { JobTask } from '../entities/job-task.entity';
import { Part } from '../entities/part.entity';
import { 
  CreateJobCardInput, 
  CreateJobTaskInput, 
  CreatePartInput,
  UpdateJobTaskStatusInput,
  UpdatePartStatusInput
} from '../dto/repair.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/user.entity';

@Resolver(() => JobCard)
@UseGuards(JwtAuthGuard)
export class JobCardResolver {
  constructor(private jobCardService: JobCardService) {}

  @Mutation(() => JobCard)
  async createJobCard(
    @Args('input') input: CreateJobCardInput,
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<JobCard> {
    return this.jobCardService.createJobCard(input, businessId, user.id);
  }

  @Mutation(() => JobTask)
  async createJobTask(
    @Args('input') input: CreateJobTaskInput,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<JobTask> {
    return this.jobCardService.createTask(input, businessId);
  }

  @Mutation(() => Part)
  async createPart(
    @Args('input') input: CreatePartInput,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Part> {
    return this.jobCardService.createPart(input, businessId);
  }

  @Query(() => [JobCard])
  async jobCards(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<JobCard[]> {
    return this.jobCardService.findJobCards(businessId);
  }

  @Query(() => JobCard)
  async jobCard(
    @Args('id', { type: () => ID }) id: number,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<JobCard> {
    return this.jobCardService.findJobCard(id, businessId);
  }

  @Mutation(() => JobTask)
  async updateJobTaskStatus(
    @Args('taskId', { type: () => ID }) taskId: number,
    @Args('input') input: UpdateJobTaskStatusInput,
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<JobTask> {
    return this.jobCardService.updateTaskStatus(taskId, input, businessId, user.id);
  }

  @Mutation(() => Part)
  async updatePartStatus(
    @Args('partId', { type: () => ID }) partId: number,
    @Args('input') input: UpdatePartStatusInput,
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Part> {
    return this.jobCardService.updatePartStatus(partId, input, businessId);
  }

  @Query(() => String, { name: 'jobCardStatistics' })
  async getJobCardStatistics(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<string> {
    const stats = await this.jobCardService.getJobCardStatistics(businessId);
    return JSON.stringify(stats);
  }
}