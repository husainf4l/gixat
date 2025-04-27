import { IsNotEmpty, IsOptional, IsString, IsEnum, IsEmail, IsBoolean, IsDate, IsUUID, IsNumber } from 'class-validator';

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

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

  @IsString()
  @IsOptional()
  color?: string;

  @IsOptional()
  mileage?: number;

  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsDate()
  lastVisit?: Date;

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus = ClientStatus.ACTIVE;

  @IsUUID()
  @IsNotEmpty()
  garageId: string;
}
