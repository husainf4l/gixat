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
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Business } from '../../business/entities/business.entity';
import { Supplier } from './supplier.entity';
import { StockMovement } from './stock-movement.entity';

export enum ItemCategory {
  ENGINE_PARTS = 'engine_parts',
  TRANSMISSION = 'transmission',
  BRAKES = 'brakes',
  ELECTRICAL = 'electrical',
  BODYWORK = 'bodywork',
  INTERIOR = 'interior',
  SUSPENSION = 'suspension',
  AC_HEATING = 'ac_heating',
  EXHAUST = 'exhaust',
  WHEELS_TIRES = 'wheels_tires',
  FLUIDS = 'fluids',
  FILTERS = 'filters',
  TOOLS = 'tools',
  CONSUMABLES = 'consumables',
  OTHER = 'other',
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

registerEnumType(ItemCategory, { name: 'ItemCategory' });
registerEnumType(StockStatus, { name: 'StockStatus' });

@ObjectType()
@Entity('inventory_items')
export class InventoryItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  sku: string; // Stock Keeping Unit

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  description: string;

  @Field(() => ItemCategory)
  @Column({ type: 'enum', enum: ItemCategory })
  category: ItemCategory;

  @Field({ nullable: true })
  @Column({ nullable: true })
  brand: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  model: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  partNumber: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  manufacturerPartNumber: string;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStock: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 5 })
  minimumStock: number;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumStock: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  unitCost: number;

  @Field()
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  sellingPrice: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  unit: string; // e.g., 'piece', 'liter', 'meter', etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  location: string; // Shelf/bin location

  @Field({ nullable: true })
  @Column({ nullable: true })
  barcode: string;

  @Field(() => StockStatus)
  @Column({ type: 'enum', enum: StockStatus, default: StockStatus.IN_STOCK })
  status: StockStatus;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  supplierId: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.inventoryItems, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Field(() => ID)
  @Column()
  businessId: number;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @OneToMany(() => StockMovement, (movement) => movement.inventoryItem)
  stockMovements: StockMovement[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastOrderDate: Date;

  @Field({ nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lastOrderQuantity: number;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  notes: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  @Field()
  get totalValue(): number {
    return Number(this.currentStock) * Number(this.unitCost);
  }

  @Field()
  get isLowStock(): boolean {
    return Number(this.currentStock) <= Number(this.minimumStock);
  }

  @Field()
  get isOutOfStock(): boolean {
    return Number(this.currentStock) <= 0;
  }

  @Field()
  get profitMargin(): number {
    if (Number(this.unitCost) === 0) return 0;
    return ((Number(this.sellingPrice) - Number(this.unitCost)) / Number(this.unitCost)) * 100;
  }
}