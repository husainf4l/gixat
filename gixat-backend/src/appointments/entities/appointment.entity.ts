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
import { Client } from '../../operations/entities/client.entity';
import { Car } from '../../operations/entities/car.entity';
import { User } from '../../user/user.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AppointmentType {
  INSPECTION = 'inspection',
  REPAIR = 'repair',
  MAINTENANCE = 'maintenance',
  CONSULTATION = 'consultation',
  PICKUP_DELIVERY = 'pickup_delivery',
}

export enum AppointmentPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

registerEnumType(AppointmentStatus, { name: 'AppointmentStatus' });
registerEnumType(AppointmentType, { name: 'AppointmentType' });
registerEnumType(AppointmentPriority, { name: 'AppointmentPriority' });

@ObjectType()
@Entity('appointments')
export class Appointment {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  appointmentNumber: string;

  @Field(() => AppointmentStatus)
  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Field(() => AppointmentType)
  @Column({ type: 'enum', enum: AppointmentType })
  type: AppointmentType;

  @Field(() => AppointmentPriority)
  @Column({ type: 'enum', enum: AppointmentPriority, default: AppointmentPriority.NORMAL })
  priority: AppointmentPriority;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  description: string;

  @Field()
  @Column()
  scheduledDate: Date;

  @Field()
  @Column()
  scheduledTime: string; // Format: "HH:MM"

  @Field()
  @Column({ default: 60 }) // Duration in minutes
  estimatedDuration: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  actualStartTime: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  actualEndTime: Date;

  @Field(() => ID)
  @Column()
  clientId: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  carId: number;

  @ManyToOne(() => Car, { nullable: true })
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

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  customerNotes: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  internalNotes: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  completionNotes: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reminderSent: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  confirmedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  cancelledAt: Date;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  cancellationReason: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  @Field()
  get displayName(): string {
    return `${this.appointmentNumber} - ${this.title}`;
  }

  @Field()
  get isUpcoming(): boolean {
    const appointmentDateTime = new Date(`${this.scheduledDate.toDateString()} ${this.scheduledTime}`);
    return appointmentDateTime > new Date() && this.status !== AppointmentStatus.CANCELLED;
  }

  @Field()
  get isOverdue(): boolean {
    if (this.status === AppointmentStatus.COMPLETED || this.status === AppointmentStatus.CANCELLED) {
      return false;
    }
    const appointmentDateTime = new Date(`${this.scheduledDate.toDateString()} ${this.scheduledTime}`);
    return appointmentDateTime < new Date();
  }

  @Field()
  get actualDuration(): number {
    if (this.actualStartTime && this.actualEndTime) {
      return Math.round((this.actualEndTime.getTime() - this.actualStartTime.getTime()) / (1000 * 60));
    }
    return 0;
  }
}