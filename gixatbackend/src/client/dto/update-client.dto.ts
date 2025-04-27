import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @IsString()
  @IsOptional()
  carModel?: string;

  @IsString()
  @IsOptional()
  plateNumber?: string;
}
