import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne,
  JoinColumn 
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Business } from '../../business/entities/business.entity';
import { User } from '../../user/user.entity';
import { InventoryItem } from './inventory-item.entity';

export enum MovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  RETURN = 'return',
  DAMAGE = 'damage',
  COUNT = 'count',
}

registerEnumType(MovementType, { name: 'MovementType' });

@ObjectType()
@Entity('stock_movements')
export class StockMovement {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  movementNumber: string;

  @Field(() => MovementType)
  @Column({ type: 'enum', enum: MovementType })
  type: MovementType;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  previousStock: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  newStock: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  unitCost: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalValue: number;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  reason: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  referenceNumber: string; // Purchase order, invoice number, etc.

  @Field(() => ID)
  @Column()
  inventoryItemId: number;

  @ManyToOne(() => InventoryItem, (item) => item.stockMovements)
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: InventoryItem;

  @Field(() => ID)
  @Column()
  businessId: number;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Field(() => ID)
  @Column()
  createdById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}