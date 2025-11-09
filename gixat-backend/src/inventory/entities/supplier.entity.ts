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
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Business } from '../../business/entities/business.entity';
import { InventoryItem } from './inventory-item.entity';

@ObjectType()
@Entity('suppliers')
export class Supplier {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  code: string; // Supplier code for easy reference

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  description: string;

  @Field()
  @Column()
  contactPerson: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  phone: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  address: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  website: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  taxId: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  paymentTerms: string; // e.g., "NET 30", "COD", etc.

  @Field({ nullable: true })
  @Column({ nullable: true, default: 0 })
  creditLimit: number;

  @Field({ nullable: true })
  @Column({ nullable: true, default: 1 })
  rating: number; // 1-5 star rating

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  notes: string;

  @Field(() => ID)
  @Column()
  businessId: number;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @OneToMany(() => InventoryItem, (item) => item.supplier)
  inventoryItems: InventoryItem[];

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}