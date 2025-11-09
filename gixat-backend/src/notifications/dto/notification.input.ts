import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEmail, IsString, IsEnum, IsOptional, IsNumber, IsPhoneNumber } from 'class-validator';
import { NotificationType, NotificationTemplate } from '../entities/notification.entity';

@InputType()
export class CreateNotificationInput {
  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => NotificationTemplate)
  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @Field()
  @IsString()
  recipient: string;

  @Field()
  @IsString()
  subject: string;

  @Field()
  @IsString()
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  relatedEntityId?: number;

  @Field(() => ID)
  @IsNumber()
  businessId: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class SendBulkNotificationInput {
  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => NotificationTemplate)
  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @Field(() => [String])
  recipients: string[];

  @Field()
  @IsString()
  subject: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => ID)
  @IsNumber()
  businessId: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class NotificationFilterInput {
  @Field(() => NotificationType, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @Field(() => NotificationTemplate, { nullable: true })
  @IsOptional()
  @IsEnum(NotificationTemplate)
  template?: NotificationTemplate;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  recipient?: string;

  @Field(() => ID)
  @IsNumber()
  businessId: number;
}