import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../user/user.entity';
import { Business } from './business.entity';
import { Role } from './role.entity';

@ObjectType()
@Entity('user_businesses')
@Index(['userId', 'businessId'], { unique: true })
export class UserBusiness {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => ID)
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.userBusinesses)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => ID)
  @Column()
  businessId: number;

  @ManyToOne(() => Business, (business) => business.userBusinesses)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_business_roles',
    joinColumn: { name: 'userBusinessId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
