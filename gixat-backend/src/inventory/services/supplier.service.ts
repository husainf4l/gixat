import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierInput } from '../dto/inventory.input';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async create(input: CreateSupplierInput): Promise<Supplier> {
    const supplier = this.supplierRepository.create(input);
    return this.supplierRepository.save(supplier);
  }

  async findAll(businessId: number): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { businessId, isActive: true },
      relations: ['inventoryItems'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number, businessId: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, businessId, isActive: true },
      relations: ['inventoryItems'],
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async update(id: number, updates: Partial<Supplier>, businessId: number): Promise<Supplier> {
    const supplier = await this.findOne(id, businessId);
    Object.assign(supplier, updates);
    return this.supplierRepository.save(supplier);
  }

  async delete(id: number, businessId: number): Promise<boolean> {
    const supplier = await this.findOne(id, businessId);
    supplier.isActive = false;
    await this.supplierRepository.save(supplier);
    return true;
  }
}