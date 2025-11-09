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
import { RepairSession } from './repair-session.entity';
import { User } from '../../user/user.entity';
import { Media } from './media.entity';
import { InspectionType } from '../enums/repair.enum';

@ObjectType()
@Entity('inspections')
export class Inspection {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => InspectionType)
  @Column({
    type: 'enum',
    enum: InspectionType,
  })
  type: InspectionType;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  findings: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  recommendations: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  mileageAtInspection: number;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  technicalNotes: string;

  @Field(() => Boolean)
  @Column({ default: false })
  passed: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  requiresFollowUp: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  inspectionDate: Date;

  // Relationships
  @Field(() => ID)
  @Column()
  repairSessionId: number;

  @ManyToOne(() => RepairSession, (session) => session.inspections)
  @JoinColumn({ name: 'repairSessionId' })
  repairSession: RepairSession;

  @Field(() => ID)
  @Column()
  inspectorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'inspectorId' })
  inspector: User;

  @OneToMany(() => Media, (media) => media.inspection)
  media: Media[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual field
  @Field()
  get summary(): string {
    return `${this.type} - ${this.title} ${this.passed ? '(Passed)' : '(Failed)'}`;
  }
}