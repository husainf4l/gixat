import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import {
  RepairSessionStatus,
  RepairPriority,
  InspectionType,
  MediaType,
  WorkDivision,
  JobStatus,
  PartStatus,
} from '../enums/repair.enum';

@InputType()
export class CreateRepairSessionInput {
  @Field()
  @IsString()
  customerRequest: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  problemDescription?: string;

  @Field(() => RepairPriority, { defaultValue: RepairPriority.NORMAL })
  @IsEnum(RepairPriority)
  priority: RepairPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @Field(() => ID)
  @IsNumber()
  carId: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  businessId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}

@InputType()
export class CreateInspectionInput {
  @Field(() => InspectionType)
  @IsEnum(InspectionType)
  type: InspectionType;

  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  findings?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  mileageAtInspection?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  technicalNotes?: string;

  @Field(() => Boolean)
  @IsBoolean()
  passed: boolean;

  @Field(() => ID)
  @IsNumber()
  repairSessionId: number;

  @Field(() => ID)
  @IsNumber()
  inspectorId: number;
}

@InputType()
export class CreateOfferInput {
  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsNumber()
  laborCost: number;

  @Field()
  @IsNumber()
  partsCost: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  discountPercentage?: number;

  @Field()
  @IsDateString()
  validUntil: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  terms?: string;

  @Field(() => ID)
  @IsNumber()
  repairSessionId: number;
}

@InputType()
export class CreateOfferItemInput {
  @Field()
  @IsString()
  description: string;

  @Field(() => WorkDivision)
  @IsEnum(WorkDivision)
  division: WorkDivision;

  @Field()
  @IsNumber()
  laborHours: number;

  @Field()
  @IsNumber()
  laborRate: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  partName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  partNumber?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  quantity: number;

  @Field({ defaultValue: 0 })
  @IsNumber()
  unitPrice: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class CreateJobCardInput {
  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsDateString()
  plannedStartDate: string;

  @Field()
  @IsDateString()
  plannedEndDate: string;

  @Field()
  @IsNumber()
  estimatedHours: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workInstructions?: string;

  @Field(() => ID)
  @IsNumber()
  repairSessionId: number;

  @Field(() => ID)
  @IsNumber()
  assignedTechnicianId: number;
}

@InputType()
export class CreateJobTaskInput {
  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => WorkDivision)
  @IsEnum(WorkDivision)
  division: WorkDivision;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  orderIndex: number;

  @Field()
  @IsNumber()
  estimatedHours: number;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  requiresApproval: boolean;

  @Field(() => ID)
  @IsNumber()
  jobCardId: number;

  @Field(() => ID)
  @IsNumber()
  assignedTechnicianId: number;
}

@InputType()
export class CreatePartInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  partNumber: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  quantity: number;

  @Field()
  @IsNumber()
  unitPrice: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supplier?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  warrantyPeriod?: string;

  @Field(() => ID)
  @IsNumber()
  jobTaskId: number;
}

@InputType()
export class UpdateRepairSessionStatusInput {
  @Field(() => RepairSessionStatus)
  @IsEnum(RepairSessionStatus)
  status: RepairSessionStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateJobTaskStatusInput {
  @Field(() => JobStatus)
  @IsEnum(JobStatus)
  status: JobStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  actualHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  issues?: string;
}

@InputType()
export class UpdatePartStatusInput {
  @Field(() => PartStatus)
  @IsEnum(PartStatus)
  status: PartStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  installedDate?: string;
}

@InputType()
export class UpdateJobCardInput {
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
  plannedStartDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  plannedEndDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workInstructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  qualityCheckNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  qualityApproved?: boolean;
}

@InputType()
export class UpdateInspectionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  findings?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  mileageAtInspection?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  technicalNotes?: string;
}
