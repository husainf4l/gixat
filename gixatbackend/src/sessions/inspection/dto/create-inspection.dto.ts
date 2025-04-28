import { IsOptional, IsString, IsObject, IsUUID } from 'class-validator';

export class CreateInspectionDto {
  @IsUUID()
  sessionId: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  checklist?: Record<string, any>;

  @IsOptional()
  @IsString()
  testDriveNotes?: string;
}