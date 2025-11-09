import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../user/user.entity';
import { UserBusiness } from './user-business.entity';

@ObjectType()
@Entity('businesses')
export class Business {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  website: string;

  // Garage-specific fields
  @Field({ nullable: true })
  @Column({ nullable: true })
  licenseNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  taxId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  servicesOffered: string; // JSON string of service types

  @Field({ nullable: true })
  @Column({ nullable: true })
  workingHours: string; // JSON string of business hours

  @Field({ nullable: true })
  @Column({ nullable: true })
  maxCapacity: number; // Maximum cars that can be serviced simultaneously

  @Field(() => ID)
  @Column()
  ownerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @OneToMany(() => UserBusiness, (userBusiness) => userBusiness.business)
  userBusinesses: UserBusiness[];

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
