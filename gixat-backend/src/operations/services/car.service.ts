import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '../entities/car.entity';
import { CreateCarInput, UpdateCarInput } from '../dto/garage.input';
import { CarStatus } from '../enums/car.enum';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
  ) {}

  async findAll(businessId?: number): Promise<Car[]> {
    const where = businessId ? { businessId, isActive: true } : { isActive: true };
    
    return this.carRepository.find({
      where,
      relations: ['client', 'business'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Car | null> {
    return this.carRepository.findOne({
      where: { id, isActive: true },
      relations: ['client', 'business'],
    });
  }

  async findByClientId(clientId: number): Promise<Car[]> {
    return this.carRepository.find({
      where: { clientId, isActive: true },
      relations: ['client', 'business'],
      order: { year: 'DESC', make: 'ASC' },
    });
  }

  async findByBusinessId(businessId: number): Promise<Car[]> {
    return this.carRepository.find({
      where: { businessId, isActive: true },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByLicensePlate(licensePlate: string, businessId: number): Promise<Car | null> {
    return this.carRepository.findOne({
      where: { licensePlate, businessId, isActive: true },
      relations: ['client', 'business'],
    });
  }

  async create(createCarInput: CreateCarInput, businessId: number): Promise<Car> {
    const { licensePlate } = createCarInput;

    // Check if car with this license plate already exists in this business
    const existingCar = await this.findByLicensePlate(licensePlate, businessId);
    if (existingCar) {
      throw new ConflictException('Car with this license plate already exists in this garage');
    }

    // Convert date strings to Date objects and add businessId
    const carData: any = { 
      ...createCarInput, 
      businessId // Override with businessId from user
    };
    if (carData.registrationDate) {
      carData.registrationDate = new Date(carData.registrationDate);
    }
    if (carData.insuranceExpiryDate) {
      carData.insuranceExpiryDate = new Date(carData.insuranceExpiryDate);
    }

    return await this.carRepository.save(carData);
  }

  async update(id: number, updateCarInput: UpdateCarInput): Promise<Car | null> {
    const car = await this.findById(id);
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    // Convert date strings to Date objects
    const updateData: any = { ...updateCarInput };
    if (updateData.registrationDate) {
      updateData.registrationDate = new Date(updateData.registrationDate);
    }
    if (updateData.insuranceExpiryDate) {
      updateData.insuranceExpiryDate = new Date(updateData.insuranceExpiryDate);
    }

    await this.carRepository.update(id, updateData);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<boolean> {
    const car = await this.findById(id);
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    await this.carRepository.update(id, { isActive: false });
    return true;
  }

  async updateStatus(id: number, status: CarStatus): Promise<Car | null> {
    const car = await this.findById(id);
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    await this.carRepository.update(id, { status });
    return this.findById(id);
  }

  async searchCars(businessId: number, searchTerm: string): Promise<Car[]> {
    return this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.client', 'client')
      .where('car.businessId = :businessId', { businessId })
      .andWhere('car.isActive = :isActive', { isActive: true })
      .andWhere(
        '(LOWER(car.make) LIKE LOWER(:search) OR LOWER(car.model) LIKE LOWER(:search) OR LOWER(car.licensePlate) LIKE LOWER(:search) OR LOWER(car.vin) LIKE LOWER(:search) OR LOWER(CONCAT(client.firstName, \' \', client.lastName)) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` },
      )
      .orderBy('car.year', 'DESC')
      .addOrderBy('car.make', 'ASC')
      .getMany();
  }

  async getCarStats(businessId: number): Promise<{
    totalCars: number;
    activeCars: number;
    inServiceCars: number;
    carsByMake: Array<{ make: string; count: number }>;
    carsByStatus: Array<{ status: string; count: number }>;
  }> {
    const totalCarsResult = await this.carRepository
      .createQueryBuilder('car')
      .select('COUNT(*)', 'count')
      .where('car.businessId = :businessId', { businessId })
      .andWhere('car.isActive = :isActive', { isActive: true })
      .getRawOne();

    const statusStats = await this.carRepository
      .createQueryBuilder('car')
      .select('car.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('car.businessId = :businessId', { businessId })
      .andWhere('car.isActive = :isActive', { isActive: true })
      .groupBy('car.status')
      .getRawMany();

    const makeStats = await this.carRepository
      .createQueryBuilder('car')
      .select('car.make', 'make')
      .addSelect('COUNT(*)', 'count')
      .where('car.businessId = :businessId', { businessId })
      .andWhere('car.isActive = :isActive', { isActive: true })
      .groupBy('car.make')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10) // Top 10 makes
      .getRawMany();

    const activeCount = statusStats.find(s => s.status === CarStatus.ACTIVE)?.count || 0;
    const inServiceCount = statusStats.find(s => s.status === CarStatus.IN_SERVICE)?.count || 0;

    return {
      totalCars: parseInt(totalCarsResult.count) || 0,
      activeCars: parseInt(activeCount) || 0,
      inServiceCars: parseInt(inServiceCount) || 0,
      carsByMake: makeStats.map(stat => ({
        make: stat.make,
        count: parseInt(stat.count) || 0,
      })),
      carsByStatus: statusStats.map(stat => ({
        status: stat.status,
        count: parseInt(stat.count) || 0,
      })),
    };
  }

  async getCarsWithExpiringInsurance(businessId: number, days: number = 30): Promise<Car[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.client', 'client')
      .where('car.businessId = :businessId', { businessId })
      .andWhere('car.isActive = :isActive', { isActive: true })
      .andWhere('car.insuranceExpiryDate IS NOT NULL')
      .andWhere('car.insuranceExpiryDate <= :futureDate', { futureDate })
      .andWhere('car.insuranceExpiryDate >= CURRENT_DATE')
      .orderBy('car.insuranceExpiryDate', 'ASC')
      .getMany();
  }
}