import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EntryType } from '../entry-type.enum';

export class CreateEntryDto {
  @IsEnum(EntryType)
  type: EntryType;

  @IsString()
  @IsOptional()
  originalMessage?: string;

  @IsString()
  @IsOptional()
  cleanedMessage?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsUUID()
  @IsOptional()
  createdById?: string;

  @IsUUID()
  sessionId: string;
}