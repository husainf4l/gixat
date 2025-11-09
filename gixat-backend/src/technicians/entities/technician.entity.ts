import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany 
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Business } from '../../business/entities/business.entity';
import { User } from '../../user/user.entity';
import { WorkDivision } from '../../operations/enums/repair.enum';

export enum TechnicianStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  BUSY = 'busy',
  INACTIVE = 'inactive',
}

registerEnumType(TechnicianStatus, { name: 'TechnicianStatus' });

@ObjectType()
@Entity('technicians')
export class Technician {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  employeeId: string;

  @Field(() => [WorkDivision])
  @Column('simple-array')
  specializations: WorkDivision[];

  @Field()
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  hourlyRate: number;

  @Field(() => TechnicianStatus)
  @Column({ type: 'enum', enum: TechnicianStatus, default: TechnicianStatus.ACTIVE })
  status: TechnicianStatus;

  @Field(() => String, { nullable: true })
  @Column('json', { nullable: true })
  workSchedule: Record<string, any>; // JSON: { "monday": {"start": "08:00", "end": "17:00"}, ... }

  @Field({ nullable: true })
  @Column({ nullable: true })
  certifications: string; // Comma-separated certifications

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  notes: string;

  @Field(() => ID)
  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => ID)
  @Column()
  businessId: number;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

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
    return `${this.employeeId} - ${this.user?.name || 'Unknown'}`;
  }

  @Field()
  get isAvailable(): boolean {
    return this.status === TechnicianStatus.ACTIVE && this.isActive;
  }
}