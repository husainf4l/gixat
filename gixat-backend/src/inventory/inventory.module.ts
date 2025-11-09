import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { Supplier } from './entities/supplier.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { InventoryService } from './services/inventory.service';
import { SupplierService } from './services/supplier.service';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, Supplier, StockMovement])],
  providers: [InventoryService, SupplierService],
  exports: [InventoryService, SupplierService],
})
export class InventoryModule {}