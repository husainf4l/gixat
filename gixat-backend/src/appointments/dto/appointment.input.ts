import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsBoolean, Matches, Min, Max } from 'class-validator';
import { AppointmentStatus, AppointmentType, AppointmentPriority } from '../entities/appointment.entity';

@InputType()
export class CreateAppointmentInput {
  @Field(() => AppointmentType)
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @Field(() => AppointmentPriority, { defaultValue: AppointmentPriority.NORMAL })
  @IsOptional()
  @IsEnum(AppointmentPriority)
  priority?: AppointmentPriority;

  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsDateString()
  scheduledDate: string;

  @Field()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:MM format' })
  scheduledTime: string;

  @Field({ defaultValue: 60 })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480) // Max 8 hours
  estimatedDuration?: number;

  @Field(() => ID)
  @IsNumber()
  clientId: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  carId?: number;

  @Field(() => ID)
  @IsNumber()
  businessId: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  assignedTechnicianId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  internalNotes?: string;
}

@InputType()
export class UpdateAppointmentInput {
  @Field(() => AppointmentType, { nullable: true })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @Field(() => AppointmentPriority, { nullable: true })
  @IsOptional()
  @IsEnum(AppointmentPriority)
  priority?: AppointmentPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:MM format' })
  scheduledTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480)
  estimatedDuration?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  assignedTechnicianId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  completionNotes?: string;
}

@InputType()
export class UpdateAppointmentStatusInput {
  @Field(() => AppointmentStatus)
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}

@InputType()
export class AppointmentFilterInput {
  @Field(() => AppointmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @Field(() => AppointmentType, { nullable: true })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  clientId?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  assignedTechnicianId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Field(() => ID)
  @IsNumber()
  businessId: number;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;
}

@InputType()
export class AvailabilityCheckInput {
  @Field()
  @IsDateString()
  date: string;

  @Field()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  startTime: string;

  @Field()
  @IsNumber()
  @Min(15)
  duration: number;

  @Field(() => ID)
  @IsNumber()
  businessId: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  technicianId?: number;
}