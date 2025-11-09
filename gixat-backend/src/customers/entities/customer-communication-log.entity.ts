import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Customer } from './customer.entity';
import { User } from '../../user/user.entity';

export enum CommunicationType {
  EMAIL = 'email',
  SMS = 'sms',
  PHONE = 'phone',
  WHATSAPP = 'whatsapp',
  IN_PERSON = 'in_person',
  SYSTEM = 'system',
}

export enum CommunicationDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

registerEnumType(CommunicationType, { name: 'CommunicationType' });
registerEnumType(CommunicationDirection, { name: 'CommunicationDirection' });

@ObjectType()
@Entity('customer_communication_logs')
export class CustomerCommunicationLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => CommunicationType)
  @Column({
    type: 'enum',
    enum: CommunicationType,
  })
  type: CommunicationType;

  @Field(() => CommunicationDirection)
  @Column({
    type: 'enum',
    enum: CommunicationDirection,
  })
  direction: CommunicationDirection;

  @Field()
  @Column()
  subject: string;

  @Field()
  @Column('text')
  message: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fromAddress: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  toAddress: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isRead: boolean;

  @Field(() => Boolean)
  @Column({ default: true })
  isDelivered: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveredAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  deliveryError: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedEntityType: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  relatedEntityId: number;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'json' })
  metadata: string;

  // Relationships
  @Field(() => ID)
  @Column()
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.communicationLogs)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  createdById: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}