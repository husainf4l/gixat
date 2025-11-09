import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsEmail, IsUrl, Min, Max } from 'class-validator';

@InputType()
export class CreateBusinessInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  // Garage-specific fields
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  servicesOffered?: string; // JSON string of services like ["Engine Repair", "Brake Service", etc.]

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workingHours?: string; // JSON string of business hours

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxCapacity?: number; // Maximum cars that can be serviced simultaneously
}

@InputType()
export class UpdateBusinessInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  servicesOffered?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxCapacity?: number;
}

@InputType()
export class GarageSettingsInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxCapacity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workingHours?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  servicesOffered?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxId?: string;
}