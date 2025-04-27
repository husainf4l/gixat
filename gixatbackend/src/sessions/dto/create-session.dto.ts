import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { SessionStatus } from '@prisma/client';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  carId: string;

  @IsNotEmpty()
  @IsString()
  garageId: string;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  quickBooksId?: string;
}