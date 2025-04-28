import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInspectionImageDto {
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  description?: string;
}