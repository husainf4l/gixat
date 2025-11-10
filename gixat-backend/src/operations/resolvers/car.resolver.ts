import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Car } from '../entities/car.entity';
import { CarService } from '../services/car.service';
import { CreateCarInput, UpdateCarInput } from '../dto/garage.input';
import { CarStatus } from '../enums/car.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/user.entity';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CarStats {
  @Field(() => Int)
  totalCars: number;

  @Field(() => Int)
  activeCars: number;

  @Field(() => Int)
  inServiceCars: number;

  @Field(() => [MakeCount])
  carsByMake: MakeCount[];

  @Field(() => [StatusCount])
  carsByStatus: StatusCount[];
}

@ObjectType()
export class MakeCount {
  @Field()
  make: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class StatusCount {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;
}

@Resolver(() => Car)
@UseGuards(JwtAuthGuard)
export class CarResolver {
  constructor(private carService: CarService) {}

  @Query(() => [Car])
  async cars(
    @Args('businessId', { type: () => ID, nullable: true }) businessId?: number,
  ): Promise<Car[]> {
    return this.carService.findAll(businessId);
  }

  @Query(() => Car, { nullable: true })
  async car(@Args('id', { type: () => ID }) id: number): Promise<Car | null> {
    return this.carService.findById(id);
  }

  @Query(() => [Car])
  async carsByClient(
    @Args('clientId', { type: () => ID }) clientId: number,
  ): Promise<Car[]> {
    return this.carService.findByClientId(clientId);
  }

  @Query(() => [Car])
  async carsByBusiness(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<Car[]> {
    return this.carService.findByBusinessId(businessId);
  }

  @Query(() => [Car])
  async searchCars(
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('searchTerm') searchTerm: string,
  ): Promise<Car[]> {
    return this.carService.searchCars(businessId, searchTerm);
  }

  @Query(() => [Car])
  async carsWithExpiringInsurance(
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('days', { type: () => Int, defaultValue: 30 }) days: number,
  ): Promise<Car[]> {
    return this.carService.getCarsWithExpiringInsurance(businessId, days);
  }

  @Query(() => CarStats)
  async carStats(
    @Args('businessId', { type: () => ID }) businessId: number,
  ): Promise<any> {
    return this.carService.getCarStats(businessId);
  }

  @Mutation(() => Car)
  async createCar(
    @Args('input') createCarInput: CreateCarInput,
    @CurrentUser() user: User,
  ): Promise<Car> {
    // Get businessId from the authenticated user
    if (!user.businessId) {
      throw new Error('User is not associated with any garage/business. Please create or join a garage first.');
    }
    return this.carService.create(createCarInput, user.businessId);
  }

  @Mutation(() => Car, { nullable: true })
  async updateCar(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') updateCarInput: UpdateCarInput,
  ): Promise<Car | null> {
    return this.carService.update(id, updateCarInput);
  }

  @Mutation(() => Car, { nullable: true })
  async updateCarStatus(
    @Args('id', { type: () => ID }) id: number,
    @Args('status', { type: () => CarStatus }) status: CarStatus,
  ): Promise<Car | null> {
    return this.carService.updateStatus(id, status);
  }

  @Mutation(() => Boolean)
  async deleteCar(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    return this.carService.softDelete(id);
  }
}