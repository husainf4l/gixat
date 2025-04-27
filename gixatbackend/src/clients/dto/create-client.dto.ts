import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

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
}
