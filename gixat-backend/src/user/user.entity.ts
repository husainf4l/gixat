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
import { UserType } from './enums/user-type.enum';
import { UserBusiness } from '../business/entities/user-business.entity';
import { Business } from '../business/entities/business.entity';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  name: string;

  @Field(() => UserType)
  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.CLIENT,
  })
  type: UserType;

  @Column()
  password: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  // One user belongs to one business (garage)
  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  businessId: number;

  @Field(() => Business, { nullable: true })
  @ManyToOne(() => Business, (business) => business.users)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @OneToMany(() => UserBusiness, (userBusiness) => userBusiness.user)
  userBusinesses: UserBusiness[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
