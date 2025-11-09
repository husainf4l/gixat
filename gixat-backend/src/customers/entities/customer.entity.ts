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
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Business } from '../../business/entities/business.entity';
import { Car } from '../../operations/entities/car.entity';
import { CustomerCommunicationLog } from './customer-communication-log.entity';
import { CustomerPreference } from './customer-preference.entity';
import { LoyaltyTransaction } from './loyalty-transaction.entity';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  INSURANCE = 'insurance',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  VIP = 'vip',
}

export enum PreferredContactMethod {
  EMAIL = 'email',
  SMS = 'sms',
  PHONE = 'phone',
  WHATSAPP = 'whatsapp',
}

registerEnumType(CustomerType, { name: 'CustomerType' });
registerEnumType(CustomerStatus, { name: 'CustomerStatus' });
registerEnumType(PreferredContactMethod, { name: 'PreferredContactMethod' });

@ObjectType()
@Entity('customers')
export class Customer {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  customerNumber: string;

  @Field()
  @Column()
  firstName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastName: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  phone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  alternativePhone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Field(() => CustomerType)
  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL,
  })
  customerType: CustomerType;

  @Field(() => CustomerStatus)
  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  // Address Information
  @Field({ nullable: true })
  @Column({ nullable: true })
  address: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  city: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  state: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  postalCode: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  country: string;

  // Business Customer Fields
  @Field({ nullable: true })
  @Column({ nullable: true })
  companyName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  taxId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  registrationNumber: string;

  // Communication Preferences
  @Field(() => PreferredContactMethod)
  @Column({
    type: 'enum',
    enum: PreferredContactMethod,
    default: PreferredContactMethod.EMAIL,
  })
  preferredContactMethod: PreferredContactMethod;

  @Field({ nullable: true })
  @Column({ nullable: true })
  whatsappNumber: string;

  @Field(() => Boolean)
  @Column({ default: true })
  emailNotifications: boolean;

  @Field(() => Boolean)
  @Column({ default: true })
  smsNotifications: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  marketingConsent: boolean;

  // Loyalty Program
  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  loyaltyPoints: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  @Field()
  @Column({ default: 0 })
  visitCount: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastVisitDate: Date;

  // Customer Rating
  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  averageRating: number;

  @Field()
  @Column({ default: 0 })
  totalReviews: number;

  // Notes and Tags
  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Field(() => [String])
  @Column('simple-array', { nullable: true })
  tags: string[];

  // Insurance Information
  @Field({ nullable: true })
  @Column({ nullable: true })
  insuranceProvider: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  insurancePolicyNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  insuranceExpiryDate: Date;

  // Emergency Contact
  @Field({ nullable: true })
  @Column({ nullable: true })
  emergencyContactName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  emergencyContactPhone: string;

  // Relationships
  @Field(() => ID)
  @Column()
  businessId: number;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @OneToMany(() => Car, (car) => car.customer)
  cars: Car[];

  @OneToMany(() => CustomerCommunicationLog, (log) => log.customer)
  communicationLogs: CustomerCommunicationLog[];

  @OneToMany(() => CustomerPreference, (preference) => preference.customer)
  preferences: CustomerPreference[];

  @OneToMany(() => LoyaltyTransaction, (transaction) => transaction.customer)
  loyaltyTransactions: LoyaltyTransaction[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual fields
  @Field()
  get fullName(): string {
    return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName;
  }

  @Field()
  get displayName(): string {
    if (this.customerType === CustomerType.BUSINESS && this.companyName) {
      return this.companyName;
    }
    return this.fullName;
  }

  @Field()
  get isVip(): boolean {
    return this.status === CustomerStatus.VIP || this.totalSpent > 10000;
  }

  @Field()
  get daysSinceLastVisit(): number {
    if (!this.lastVisitDate) return -1;
    return Math.floor((new Date().getTime() - this.lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
  }
}