import { registerEnumType } from '@nestjs/graphql';

export enum RepairSessionStatus {
  CUSTOMER_REQUEST = 'customer_request',
  INITIAL_INSPECTION = 'initial_inspection',
  TEST_DRIVE_INSPECTION = 'test_drive_inspection',
  OFFER_PREPARATION = 'offer_preparation',
  OFFER_SENT = 'offer_sent',
  OFFER_APPROVED = 'offer_approved',
  OFFER_REJECTED = 'offer_rejected',
  JOB_CARD_CREATED = 'job_card_created',
  REPAIR_IN_PROGRESS = 'repair_in_progress',
  QUALITY_CHECK = 'quality_check',
  FINAL_INSPECTION = 'final_inspection',
  READY_FOR_DELIVERY = 'ready_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum InspectionType {
  INITIAL = 'initial',
  TEST_DRIVE = 'test_drive',
  QUALITY_CHECK = 'quality_check',
  FINAL = 'final',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export enum RepairPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum WorkDivision {
  ENGINE = 'engine',
  TRANSMISSION = 'transmission',
  BRAKES = 'brakes',
  ELECTRICAL = 'electrical',
  BODYWORK = 'bodywork',
  INTERIOR = 'interior',
  SUSPENSION = 'suspension',
  AC_HEATING = 'ac_heating',
  EXHAUST = 'exhaust',
  WHEELS_TIRES = 'wheels_tires',
  DIAGNOSTIC = 'diagnostic',
  GENERAL = 'general',
}

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

export enum PartStatus {
  AVAILABLE = 'available',
  ORDERED = 'ordered',
  BACK_ORDER = 'back_order',
  INSTALLED = 'installed',
  RETURNED = 'returned',
}

registerEnumType(RepairSessionStatus, {
  name: 'RepairSessionStatus',
  description: 'Status of the repair session workflow',
});

registerEnumType(InspectionType, {
  name: 'InspectionType',
  description: 'Type of inspection being performed',
});

registerEnumType(MediaType, {
  name: 'MediaType',
  description: 'Type of media file',
});

registerEnumType(RepairPriority, {
  name: 'RepairPriority',
  description: 'Priority level of the repair',
});

registerEnumType(WorkDivision, {
  name: 'WorkDivision',
  description: 'Division/department handling the work',
});

registerEnumType(JobStatus, {
  name: 'JobStatus',
  description: 'Status of individual job tasks',
});

registerEnumType(PartStatus, {
  name: 'PartStatus',
  description: 'Status of parts in the repair process',
});