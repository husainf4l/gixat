import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { InventoryItem, StockStatus } from '../entities/inventory-item.entity';
import { StockMovement, MovementType } from '../entities/stock-movement.entity';
import { 
  CreateInventoryItemInput, 
  UpdateInventoryItemInput, 
  StockMovementInput, 
  InventoryFilterInput 
} from '../dto/inventory.input';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
  ) {}

  async createItem(input: CreateInventoryItemInput): Promise<InventoryItem> {
    // Generate unique SKU
    const sku = await this.generateSKU(input.businessId, input.category);
    
    const item = this.inventoryRepository.create({
      ...input,
      sku,
      status: this.determineStockStatus(input.currentStock, input.minimumStock || 5),
    });

    const savedItem = await this.inventoryRepository.save(item);

    // Create initial stock movement if there's initial stock
    if (input.currentStock > 0) {
      await this.createStockMovement({
        type: MovementType.ADJUSTMENT,
        quantity: input.currentStock,
        reason: 'Initial stock entry',
        inventoryItemId: savedItem.id,
        businessId: input.businessId,
      }, 1); // Assuming system user ID = 1
    }

    return savedItem;
  }

  async findAll(filter: InventoryFilterInput): Promise<InventoryItem[]> {
    const query = this.inventoryRepository.createQueryBuilder('item')
      .leftJoinAndSelect('item.supplier', 'supplier')
      .where('item.businessId = :businessId', { businessId: filter.businessId });

    if (!filter.includeInactive) {
      query.andWhere('item.isActive = true');
    }

    if (filter.category) {
      query.andWhere('item.category = :category', { category: filter.category });
    }

    if (filter.status) {
      query.andWhere('item.status = :status', { status: filter.status });
    }

    if (filter.supplierId) {
      query.andWhere('item.supplierId = :supplierId', { supplierId: filter.supplierId });
    }

    if (filter.lowStockOnly) {
      query.andWhere('item.currentStock <= item.minimumStock');
    }

    if (filter.searchTerm) {
      query.andWhere(
        '(item.name ILIKE :searchTerm OR item.partNumber ILIKE :searchTerm OR item.sku ILIKE :searchTerm OR item.brand ILIKE :searchTerm)',
        { searchTerm: `%${filter.searchTerm}%` }
      );
    }

    return query
      .orderBy('item.name', 'ASC')
      .getMany();
  }

  async findOne(id: number, businessId: number): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id, businessId, isActive: true },
      relations: ['supplier', 'stockMovements', 'stockMovements.createdBy'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return item;
  }

  async updateItem(id: number, updates: UpdateInventoryItemInput, businessId: number): Promise<InventoryItem> {
    const item = await this.findOne(id, businessId);
    
    Object.assign(item, updates);
    
    // Update stock status if minimum stock changed
    if (updates.minimumStock !== undefined) {
      item.status = this.determineStockStatus(item.currentStock, updates.minimumStock);
    }

    return this.inventoryRepository.save(item);
  }

  async createStockMovement(input: StockMovementInput, createdById: number): Promise<StockMovement> {
    const item = await this.findOne(input.inventoryItemId, input.businessId);
    
    const previousStock = item.currentStock;
    let newStock: number;
    
    // Calculate new stock based on movement type
    switch (input.type) {
      case MovementType.PURCHASE:
      case MovementType.ADJUSTMENT:
      case MovementType.RETURN:
        newStock = Number(previousStock) + Number(input.quantity);
        break;
      case MovementType.SALE:
      case MovementType.DAMAGE:
        newStock = Number(previousStock) - Number(input.quantity);
        break;
      case MovementType.COUNT:
        newStock = Number(input.quantity); // Direct stock count
        break;
      default:
        newStock = Number(previousStock) + Number(input.quantity);
    }

    // Prevent negative stock for sales/damage
    if (newStock < 0 && (input.type === MovementType.SALE || input.type === MovementType.DAMAGE)) {
      throw new BadRequestException('Insufficient stock for this operation');
    }

    // Generate movement number
    const movementNumber = await this.generateMovementNumber(input.businessId);

    const movement = this.stockMovementRepository.create({
      ...input,
      movementNumber,
      previousStock: Number(previousStock),
      newStock,
      totalValue: input.unitCost ? Number(input.quantity) * Number(input.unitCost) : undefined,
      createdById,
    });

    const savedMovement = await this.stockMovementRepository.save(movement);

    // Update inventory item stock and status
    item.currentStock = newStock;
    item.status = this.determineStockStatus(newStock, item.minimumStock);
    
    if (input.type === MovementType.PURCHASE) {
      item.lastOrderDate = new Date();
      item.lastOrderQuantity = Number(input.quantity);
      if (input.unitCost) {
        item.unitCost = Number(input.unitCost);
      }
    }

    await this.inventoryRepository.save(item);

    return savedMovement;
  }

  async getLowStockItems(businessId: number): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { businessId, isActive: true },
      relations: ['supplier'],
    }).then(items => items.filter(item => item.isLowStock));
  }

  async getOutOfStockItems(businessId: number): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { businessId, isActive: true },
      relations: ['supplier'],
    }).then(items => items.filter(item => item.isOutOfStock));
  }

  async getInventoryValue(businessId: number): Promise<number> {
    const items = await this.inventoryRepository.find({
      where: { businessId, isActive: true },
    });

    return items.reduce((total, item) => total + item.totalValue, 0);
  }

  async getStockMovements(businessId: number, itemId?: number): Promise<StockMovement[]> {
    const where: any = { businessId };
    if (itemId) {
      where.inventoryItemId = itemId;
    }

    return this.stockMovementRepository.find({
      where,
      relations: ['inventoryItem', 'createdBy'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getInventoryStatistics(businessId: number): Promise<any> {
    const totalItems = await this.inventoryRepository.count({
      where: { businessId, isActive: true },
    });

    const lowStockItems = await this.getLowStockItems(businessId);
    const outOfStockItems = await this.getOutOfStockItems(businessId);
    const totalValue = await this.getInventoryValue(businessId);

    const categoryBreakdown = await this.inventoryRepository
      .createQueryBuilder('item')
      .select('item.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(item.currentStock * item.unitCost)', 'value')
      .where('item.businessId = :businessId', { businessId })
      .andWhere('item.isActive = true')
      .groupBy('item.category')
      .getRawMany();

    return {
      totalItems,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      totalValue,
      categoryBreakdown,
    };
  }

  private determineStockStatus(currentStock: number, minimumStock: number): StockStatus {
    const stock = Number(currentStock);
    const minStock = Number(minimumStock);
    
    if (stock <= 0) return StockStatus.OUT_OF_STOCK;
    if (stock <= minStock) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }

  private async generateSKU(businessId: number, category: string): Promise<string> {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const count = await this.inventoryRepository.count({ where: { businessId } });
    return `${categoryCode}-${businessId}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generateMovementNumber(businessId: number): Promise<string> {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.stockMovementRepository.count({
      where: { businessId },
    });
    return `MOV-${businessId}-${today}-${String(count + 1).padStart(3, '0')}`;
  }
}