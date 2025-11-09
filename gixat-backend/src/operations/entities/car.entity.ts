import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Client } from './client.entity';
import { Business } from '../../business/entities/business.entity';
import { Customer } from '../../customers/entities/customer.entity';
import {
  CarMake,
  FuelType,
  TransmissionType,
  CarColor,
  CarStatus,
} from '../enums/car.enum';

@ObjectType()
@Entity('cars')
@Index(['licensePlate', 'businessId'], { unique: true })
@Index(['vin'], { unique: true, where: 'vin IS NOT NULL' })
export class Car {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => CarMake)
  @Column({
    type: 'enum',
    enum: CarMake,
  })
  make: CarMake;

  @Field()
  @Column()
  model: string;

  @Field(() => Int)
  @Column()
  year: number;

  @Field()
  @Column()
  licensePlate: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  vin: string;

  @Field(() => CarColor)
  @Column({
    type: 'enum',
    enum: CarColor,
  })
  color: CarColor;

  @Field(() => FuelType)
  @Column({
    type: 'enum',
    enum: FuelType,
  })
  fuelType: FuelType;

  @Field(() => TransmissionType)
  @Column({
    type: 'enum',
    enum: TransmissionType,
  })
  transmission: TransmissionType;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  engineSize: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  mileage: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  registrationDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  insuranceCompany: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  insurancePolicyNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  insuranceExpiryDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Field(() => CarStatus)
  @Column({
    type: 'enum',
    enum: CarStatus,
    default: CarStatus.ACTIVE,
  })
  status: CarStatus;

  @Field(() => ID)
  @Column()
  clientId: number;

  @ManyToOne(() => Client, (client) => client.cars)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Field(() => ID)
  @Column()
  businessId: number;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  // Enhanced customer relationship
  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.cars, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual field for display name
  @Field()
  get displayName(): string {
    return `${this.year} ${this.make} ${this.model} (${this.licensePlate})`;
  }
}