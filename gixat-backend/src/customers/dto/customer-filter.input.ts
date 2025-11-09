import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean } from 'class-validator';
import { CustomerType, CustomerStatus } from '../entities/customer.entity';

@InputType()
export class CustomerFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => CustomerType, { nullable: true })
  @IsOptional()
  @IsEnum(CustomerType)
  customerType?: CustomerType;

  @Field(() => CustomerStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

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
  @IsBoolean()
  isVip?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  minTotalSpent?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  maxTotalSpent?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  minVisitCount?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class CustomerSortInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  field?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}