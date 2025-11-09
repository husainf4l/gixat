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
import { JobTask } from './job-task.entity';
import { Media } from './media.entity';
import { JobStatus } from '../enums/repair.enum';

@ObjectType()
@Entity('job_cards')
export class JobCard {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  jobNumber: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Field(() => JobStatus)
  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @Field()
  @Column()
  plannedStartDate: Date;

  @Field()
  @Column()
  plannedEndDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  actualStartDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  actualEndDate: Date;

  @Field()
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  estimatedHours: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  actualHours: number;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  workInstructions: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  completionNotes: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  qualityCheckNotes: string;

  @Field(() => Boolean)
  @Column({ default: false })
  qualityApproved: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  qualityApprovedAt: Date;

  // Relationships
  @Field(() => ID)
  @Column()
  repairSessionId: number;

  @ManyToOne(() => RepairSession, (session) => session.jobCards)
  @JoinColumn({ name: 'repairSessionId' })
  repairSession: RepairSession;

  @Field(() => ID)
  @Column()
  assignedTechnicianId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedTechnicianId' })
  assignedTechnician: User;

  @Field(() => ID)
  @Column()
  createdById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  qualityApprovedById: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'qualityApprovedById' })
  qualityApprovedBy: User;

  @OneToMany(() => JobTask, (task) => task.jobCard)
  tasks: JobTask[];

  @OneToMany(() => Media, (media) => media.jobCard)
  media: Media[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  @Field()
  get progress(): number {
    if (!this.tasks || this.tasks.length === 0) return 0;
    
    const completedTasks = this.tasks.filter(task => task.status === JobStatus.COMPLETED);
    return Math.round((completedTasks.length / this.tasks.length) * 100);
  }

  @Field()
  get isOverdue(): boolean {
    if (this.status === JobStatus.COMPLETED) return false;
    return new Date() > this.plannedEndDate;
  }

  @Field({ nullable: true })
  get daysRemaining(): number {
    if (this.status === JobStatus.COMPLETED) return 0;
    
    const today = new Date();
    const diffTime = this.plannedEndDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}