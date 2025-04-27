import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  carModel: string;

  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @IsEnum(ClientStatus)
  @IsOptional()
  status?: ClientStatus;

  @IsString()
  @IsOptional()
  color?: string;

  @IsOptional()
  mileage?: number;

  @IsOptional()
  year?: number;
}
