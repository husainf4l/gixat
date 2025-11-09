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
import { Car } from './car.entity';
import { Business } from '../../business/entities/business.entity';
import { User } from '../../user/user.entity';
import { Inspection } from './inspection.entity';
import { Offer } from './offer.entity';
import { JobCard } from './job-card.entity';
import { RepairSessionStatus, RepairPriority } from '../enums/repair.enum';

@ObjectType()
@Entity('repair_sessions')
export class RepairSession {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  sessionNumber: string;

  @Field()
  @Column()
  customerRequest: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  problemDescription: string;

  @Field(() => RepairSessionStatus)
  @Column({
    type: 'enum',
    enum: RepairSessionStatus,
    default: RepairSessionStatus.CUSTOMER_REQUEST,
  })
  status: RepairSessionStatus;

  @Field(() => RepairPriority)
  @Column({
    type: 'enum',
    enum: RepairPriority,
    default: RepairPriority.NORMAL,
  })
  priority: RepairPriority;

  @Field({ nullable: true })
  @Column({ nullable: true })
  expectedDeliveryDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  actualDeliveryDate: Date;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualCost: number;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  customerNotes: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  internalNotes: string;

  // Relationships
  @Field(() => ID)
  @Column()
  carId: number;

  @ManyToOne(() => Car)
  @JoinColumn({ name: 'carId' })
  car: Car;

  @Field(() => ID)
  @Column()
  businessId: number;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  assignedTechnicianId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTechnicianId' })
  assignedTechnician: User;

  @Field(() => ID)
  @Column()
  createdById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  // Related entities
  @OneToMany(() => Inspection, (inspection) => inspection.repairSession)
  inspections: Inspection[];

  @OneToMany(() => Offer, (offer) => offer.repairSession)
  offers: Offer[];

  @OneToMany(() => JobCard, (jobCard) => jobCard.repairSession)
  jobCards: JobCard[];

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  @Field()
  get displayName(): string {
    return `${this.sessionNumber} - ${this.car?.displayName || 'Unknown Car'}`;
  }

  @Field()
  get isCompleted(): boolean {
    return this.status === RepairSessionStatus.DELIVERED;
  }

  @Field({ nullable: true })
  get daysInProgress(): number {
    if (this.actualDeliveryDate) {
      return Math.ceil(
        (this.actualDeliveryDate.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
    return Math.ceil(
      (new Date().getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}