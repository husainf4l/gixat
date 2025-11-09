import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { RepairSession } from './repair-session.entity';
import { Inspection } from './inspection.entity';
import { JobCard } from './job-card.entity';
import { MediaType } from '../enums/repair.enum';

@ObjectType()
@Entity('media')
export class Media {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  filename: string;

  @Field()
  @Column()
  originalName: string;

  @Field()
  @Column()
  filePath: string;

  @Field(() => MediaType)
  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @Field()
  @Column()
  mimeType: string;

  @Field()
  @Column({ type: 'bigint' })
  size: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  tags: string;

  // Relationships (one media can belong to different entities)
  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  repairSessionId: number;

  @ManyToOne(() => RepairSession, { nullable: true })
  @JoinColumn({ name: 'repairSessionId' })
  repairSession: RepairSession;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  inspectionId: number;

  @ManyToOne(() => Inspection, { nullable: true })
  @JoinColumn({ name: 'inspectionId' })
  inspection: Inspection;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  jobCardId: number;

  @ManyToOne(() => JobCard, { nullable: true })
  @JoinColumn({ name: 'jobCardId' })
  jobCard: JobCard;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  @Field()
  get url(): string {
    return `/uploads/${this.filename}`;
  }

  @Field()
  get sizeInMB(): number {
    return Math.round((this.size / (1024 * 1024)) * 100) / 100;
  }
}