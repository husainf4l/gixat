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
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { JobCard } from './job-card.entity';
import { User } from '../../user/user.entity';
import { Part } from './part.entity';
import { WorkDivision, JobStatus } from '../enums/repair.enum';

@ObjectType()
@Entity('job_tasks')
export class JobTask {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Field(() => WorkDivision)
  @Column({
    type: 'enum',
    enum: WorkDivision,
  })
  division: WorkDivision;

  @Field(() => JobStatus)
  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @Field(() => Int)
  @Column({ default: 1 })
  orderIndex: number;

  @Field()
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  estimatedHours: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  actualHours: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  startedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  completedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  workNotes: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  issues: string;

  @Field(() => Boolean)
  @Column({ default: false })
  requiresApproval: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  isApproved: boolean;

  // Relationships
  @Field(() => ID)
  @Column()
  jobCardId: number;

  @ManyToOne(() => JobCard, (jobCard) => jobCard.tasks)
  @JoinColumn({ name: 'jobCardId' })
  jobCard: JobCard;

  @Field(() => ID)
  @Column()
  assignedTechnicianId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedTechnicianId' })
  assignedTechnician: User;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  approvedById: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @OneToMany(() => Part, (part) => part.jobTask)
  parts: Part[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  @Field(() => Number, { nullable: true })
  get duration(): number | null {
    if (!this.startedAt || !this.completedAt) return null;
    
    const diffTime = this.completedAt.getTime() - this.startedAt.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 100)) / 100; // Hours with 2 decimal places
  }

  @Field()
  get isOverdue(): boolean {
    if (this.status === JobStatus.COMPLETED) return false;
    
    // This is a simplified check - in real implementation, you might have task deadlines
    return this.actualHours > this.estimatedHours * 1.2; // 20% over estimate
  }
}