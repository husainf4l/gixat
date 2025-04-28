import { IsOptional, IsString, IsObject, IsUUID, IsArray, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInspectionImageDto } from './create-inspection-image.dto';

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInspectionImageDto)
  images?: CreateInspectionImageDto[];
}