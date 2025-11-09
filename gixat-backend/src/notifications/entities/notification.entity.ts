import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn 
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Business } from '../../business/entities/business.entity';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export enum NotificationTemplate {
  REPAIR_STATUS_UPDATE = 'repair_status_update',
  OFFER_READY = 'offer_ready',
  READY_FOR_PICKUP = 'ready_for_pickup',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  INSURANCE_EXPIRY = 'insurance_expiry',
  WELCOME_MESSAGE = 'welcome_message',
}

registerEnumType(NotificationType, { name: 'NotificationType' });
registerEnumType(NotificationStatus, { name: 'NotificationStatus' });
registerEnumType(NotificationTemplate, { name: 'NotificationTemplate' });

@ObjectType()
@Entity('notifications')
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => NotificationType)
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Field(() => NotificationTemplate)
  @Column({ type: 'enum', enum: NotificationTemplate })
  template: NotificationTemplate;

  @Field(() => NotificationStatus)
  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Field()
  @Column()
  recipient: string; // email address or phone number

  @Field()
  @Column()
  subject: string;

  @Field()
  @Column('text')
  content: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedEntityType: string; // 'repair_session', 'appointment', 'car', etc.

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  relatedEntityId: number;

  @Field(() => ID)
  @Column()
  businessId: number;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Field(() => String, { nullable: true })
  @Column('json', { nullable: true })
  metadata: Record<string, any>; // additional data for templates

  @Field({ nullable: true })
  @Column({ nullable: true })
  sentAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveredAt: Date;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  errorMessage: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}