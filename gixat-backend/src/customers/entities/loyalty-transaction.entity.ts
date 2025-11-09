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

export enum LoyaltyTransactionType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  BONUS = 'bonus',
  ADJUSTMENT = 'adjustment',
}

registerEnumType(LoyaltyTransactionType, { name: 'LoyaltyTransactionType' });

@ObjectType()
@Entity('loyalty_transactions')
export class LoyaltyTransaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => LoyaltyTransactionType)
  @Column({
    type: 'enum',
    enum: LoyaltyTransactionType,
  })
  type: LoyaltyTransactionType;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  points: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceBefore: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceAfter: number;

  @Field()
  @Column()
  reason: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  expiryDate: Date;

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

  @ManyToOne(() => Customer, (customer) => customer.loyaltyTransactions)
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