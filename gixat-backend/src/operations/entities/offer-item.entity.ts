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
import { Offer } from './offer.entity';
import { WorkDivision } from '../enums/repair.enum';

@ObjectType()
@Entity('offer_items')
export class OfferItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  description: string;

  @Field(() => WorkDivision)
  @Column({
    type: 'enum',
    enum: WorkDivision,
  })
  division: WorkDivision;

  @Field()
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  laborHours: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  laborRate: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  laborCost: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  partName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  partNumber: string;

  @Field()
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitPrice: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  partsCost: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  notes: string;

  // Relationships
  @Field(() => ID)
  @Column()
  offerId: number;

  @ManyToOne(() => Offer, (offer) => offer.items)
  @JoinColumn({ name: 'offerId' })
  offer: Offer;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}