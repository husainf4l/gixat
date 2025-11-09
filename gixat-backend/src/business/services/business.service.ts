import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../entities/business.entity';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find({
      where: { isActive: true },
      relations: ['owner'],
    });
  }

  async findById(id: number): Promise<Business | null> {
    return this.businessRepository.findOne({
      where: { id },
      relations: ['owner', 'userBusinesses'],
    });
  }

  async findByOwnerId(ownerId: number): Promise<Business[]> {
    return this.businessRepository.find({
      where: { ownerId, isActive: true },
    });
  }

  async create(businessData: Partial<Business>): Promise<Business> {
    const business = this.businessRepository.create(businessData);
    return this.businessRepository.save(business);
  }

  async update(id: number, businessData: Partial<Business>): Promise<Business | null> {
    await this.businessRepository.update(id, businessData);
    return this.findById(id);
  }

  // Garage-specific methods
  async getGarageCapacity(businessId: number): Promise<{ current: number; max: number }> {
    const business = await this.findById(businessId);
    // TODO: Calculate current capacity from active repair sessions
    return {
      current: 0, // Will be calculated from active jobs
      max: business?.maxCapacity || 10, // Default capacity
    };
  }

  async updateGarageSettings(
    businessId: number, 
    settings: {
      maxCapacity?: number;
      workingHours?: string;
      servicesOffered?: string;
      licenseNumber?: string;
      taxId?: string;
    }
  ): Promise<Business | null> {
    await this.businessRepository.update(businessId, settings);
    return this.findById(businessId);
  }

  async getGarageStatistics(businessId: number): Promise<any> {
    // TODO: Aggregate statistics from repair sessions, clients, etc.
    return {
      totalClients: 0,
      activeSessions: 0,
      completedThisMonth: 0,
      revenue: 0,
    };
  }
}
