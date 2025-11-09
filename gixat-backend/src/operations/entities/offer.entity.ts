import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { RepairSession } from './repair-session.entity';
import { User } from '../../user/user.entity';
import { OfferItem } from './offer-item.entity';

@ObjectType()
@Entity('offers')
export class Offer {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  offerNumber: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  laborCost: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  partsCost: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercentage: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Field()
  @Column()
  validUntil: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  approvedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  rejectedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  rejectionReason: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  customerNotes: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  terms: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isApproved: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  isRejected: boolean;

  // Relationships
  @Field(() => ID)
  @Column()
  repairSessionId: number;

  @ManyToOne(() => RepairSession, (session) => session.offers)
  @JoinColumn({ name: 'repairSessionId' })
  repairSession: RepairSession;

  @Field(() => ID)
  @Column()
  createdById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  approvedById: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @OneToMany(() => OfferItem, (item) => item.offer)
  items: OfferItem[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  @Field()
  get status(): string {
    if (this.isApproved) return 'approved';
    if (this.isRejected) return 'rejected';
    if (new Date() > this.validUntil) return 'expired';
    return 'pending';
  }

  @Field()
  get isExpired(): boolean {
    return new Date() > this.validUntil && !this.isApproved && !this.isRejected;
  }
}