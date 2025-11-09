import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsEnum, IsOptional, IsNumber, IsEmail, IsBoolean, Min, Max } from 'class-validator';
import { ItemCategory, StockStatus } from '../entities/inventory-item.entity';
import { MovementType } from '../entities/stock-movement.entity';

@InputType()
export class CreateSupplierInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  code: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsString()
  contactPerson: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  phone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @Field(() => ID)
  @IsNumber()
  businessId: number;
}

@InputType()
export class CreateInventoryItemInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ItemCategory)
  @IsEnum(ItemCategory)
  category: ItemCategory;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  partNumber?: string;

  @Field()
  @IsNumber()
  @Min(0)
  currentStock: number;

  @Field({ defaultValue: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStock?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumStock?: number;

  @Field()
  @IsNumber()
  @Min(0)
  unitCost: number;

  @Field()
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  unit?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @Field(() => ID)
  @IsNumber()
  businessId: number;
}

@InputType()
export class UpdateInventoryItemInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ItemCategory, { nullable: true })
  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  partNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStock?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumStock?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  unit?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @Field(() => StockStatus, { nullable: true })
  @IsOptional()
  @IsEnum(StockStatus)
  status?: StockStatus;
}

@InputType()
export class StockMovementInput {
  @Field(() => MovementType)
  @IsEnum(MovementType)
  type: MovementType;

  @Field()
  @IsNumber()
  quantity: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @Field(() => ID)
  @IsNumber()
  inventoryItemId: number;

  @Field(() => ID)
  @IsNumber()
  businessId: number;
}

@InputType()
export class InventoryFilterInput {
  @Field(() => ItemCategory, { nullable: true })
  @IsOptional()
  @IsEnum(ItemCategory)
  category?: ItemCategory;

  @Field(() => StockStatus, { nullable: true })
  @IsOptional()
  @IsEnum(StockStatus)
  status?: StockStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  lowStockOnly?: boolean;

  @Field(() => ID)
  @IsNumber()
  businessId: number;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;
}