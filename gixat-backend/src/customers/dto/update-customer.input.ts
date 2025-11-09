import { InputType, Field, ID } from '@nestjs/graphql';
import { 
  IsOptional, 
  IsEnum, 
  IsString, 
  IsBoolean,
  IsDateString,
  IsArray,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { 
  CustomerStatus, 
  PreferredContactMethod 
} from '../entities/customer.entity';

@InputType()
export class UpdateCustomerInput {
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
  @IsPhoneNumber()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  alternativePhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field(() => CustomerStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

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
  postalCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @Field(() => PreferredContactMethod, { nullable: true })
  @IsOptional()
  @IsEnum(PreferredContactMethod)
  preferredContactMethod?: PreferredContactMethod;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  whatsappNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

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
  emergencyContactName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  emergencyContactPhone?: string;
}