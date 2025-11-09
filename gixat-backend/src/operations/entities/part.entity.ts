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
import { JobTask } from './job-task.entity';
import { PartStatus } from '../enums/repair.enum';

@ObjectType()
@Entity('parts')
export class Part {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  partNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  brand: string;

  @Field()
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  supplier: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  supplierPartNumber: string;

  @Field(() => PartStatus)
  @Column({
    type: 'enum',
    enum: PartStatus,
    default: PartStatus.ORDERED,
  })
  status: PartStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  orderedDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  expectedDeliveryDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  actualDeliveryDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  installedDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  warrantyPeriod: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  warrantyExpiryDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  notes: string;

  // Relationships
  @Field(() => ID)
  @Column()
  jobTaskId: number;

  @ManyToOne(() => JobTask, (jobTask) => jobTask.parts)
  @JoinColumn({ name: 'jobTaskId' })
  jobTask: JobTask;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  @Field()
  get isDelayed(): boolean {
    if (this.status === PartStatus.INSTALLED || this.status === PartStatus.AVAILABLE) {
      return false;
    }
    
    if (this.expectedDeliveryDate) {
      return new Date() > this.expectedDeliveryDate;
    }
    
    return false;
  }

  @Field({ nullable: true })
  get deliveryStatus(): string {
    if (this.status === PartStatus.INSTALLED) return 'installed';
    if (this.status === PartStatus.AVAILABLE) return 'ready_to_install';
    if (this.actualDeliveryDate) return 'delivered';
    if (this.isDelayed) return 'delayed';
    if (this.status === PartStatus.ORDERED) return 'ordered';
    return 'pending';
  }
}