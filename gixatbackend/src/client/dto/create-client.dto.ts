import { IsString, IsEmail, IsOptional, IsBoolean, IsDate, IsEnum } from 'class-validator';

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export class CreateClientDto {
  @IsString()
  name: string;

  @IsString()
  carModel: string;

  @IsString()
  plateNumber: string;

  @IsString()
  mobileNumber: string;

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
}
