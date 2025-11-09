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
import { Customer } from './customer.entity';

@ObjectType()
@Entity('customer_preferences')
export class CustomerPreference {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  category: string;

  @Field()
  @Column()
  key: string;

  @Field()
  @Column('text')
  value: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @Field(() => ID)
  @Column()
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.preferences)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}