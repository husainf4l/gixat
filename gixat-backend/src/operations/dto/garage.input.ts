import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { CarMake, FuelType, TransmissionType, CarColor, CarStatus } from '../enums/car.enum';

@InputType()
export class CreateClientInput {
  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  phone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  businessId?: number;
}

@InputType()
export class UpdateClientInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class CreateCarInput {
  @Field(() => CarMake)
  @IsEnum(CarMake)
  make: CarMake;

  @Field()
  @IsString()
  model: string;

  @Field(() => Int)
  @IsNumber()
  year: number;

  @Field()
  @IsString()
  licensePlate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  vin?: string;

  @Field(() => CarColor)
  @IsEnum(CarColor)
  color: CarColor;

  @Field(() => FuelType)
  @IsEnum(FuelType)
  fuelType: FuelType;

  @Field(() => TransmissionType)
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  engineSize?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  mileage?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  insuranceCompany?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  insuranceExpiryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => ID)
  @IsNumber()
  clientId: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  businessId?: number;
}

@InputType()
export class UpdateCarInput {
  @Field(() => CarMake, { nullable: true })
  @IsOptional()
  @IsEnum(CarMake)
  make?: CarMake;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  model?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  year?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  vin?: string;

  @Field(() => CarColor, { nullable: true })
  @IsOptional()
  @IsEnum(CarColor)
  color?: CarColor;

  @Field(() => FuelType, { nullable: true })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @Field(() => TransmissionType, { nullable: true })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  engineSize?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  mileage?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  insuranceCompany?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  insuranceExpiryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => CarStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CarStatus)
  status?: CarStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isActive?: boolean;
}