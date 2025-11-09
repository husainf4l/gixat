import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientInput, UpdateClientInput } from '../dto/garage.input';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async findAll(businessId?: number): Promise<Client[]> {
    const where = businessId ? { businessId, isActive: true } : { isActive: true };
    
    return this.clientRepository.find({
      where,
      relations: ['business', 'cars'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { id, isActive: true },
      relations: ['business', 'cars'],
    });
  }

  async findByBusinessId(businessId: number): Promise<Client[]> {
    return this.clientRepository.find({
      where: { businessId, isActive: true },
      relations: ['cars'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findByEmail(email: string, businessId: number): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { email, businessId, isActive: true },
      relations: ['business', 'cars'],
    });
  }

  async create(createClientInput: CreateClientInput): Promise<Client> {
    const { email, businessId } = createClientInput;

    // Check if client already exists in this business
    const existingClient = await this.findByEmail(email, businessId);
    if (existingClient) {
      throw new ConflictException('Client with this email already exists in this garage');
    }

    // Convert date strings to Date objects
    const clientData: any = { ...createClientInput };
    if (clientData.dateOfBirth) {
      clientData.dateOfBirth = new Date(clientData.dateOfBirth);
    }

    return await this.clientRepository.save(clientData);
  }

  async update(id: number, updateClientInput: UpdateClientInput): Promise<Client | null> {
    const client = await this.findById(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Convert date strings to Date objects
    const updateData: any = { ...updateClientInput };
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    await this.clientRepository.update(id, updateData);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<boolean> {
    const client = await this.findById(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.clientRepository.update(id, { isActive: false });
    return true;
  }

  async searchClients(businessId: number, searchTerm: string): Promise<Client[]> {
    return this.clientRepository
      .createQueryBuilder('client')
      .where('client.businessId = :businessId', { businessId })
      .andWhere('client.isActive = :isActive', { isActive: true })
      .andWhere(
        '(LOWER(client.firstName) LIKE LOWER(:search) OR LOWER(client.lastName) LIKE LOWER(:search) OR LOWER(client.email) LIKE LOWER(:search) OR LOWER(client.phone) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` },
      )
      .leftJoinAndSelect('client.cars', 'cars')
      .orderBy('client.lastName', 'ASC')
      .addOrderBy('client.firstName', 'ASC')
      .getMany();
  }

  async getClientStats(businessId: number): Promise<{
    totalClients: number;
    activeClients: number;
    clientsWithCars: number;
    totalCars: number;
  }> {
    const totalClientsResult = await this.clientRepository
      .createQueryBuilder('client')
      .select('COUNT(*)', 'count')
      .where('client.businessId = :businessId', { businessId })
      .andWhere('client.isActive = :isActive', { isActive: true })
      .getRawOne();

    const clientsWithCarsResult = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.cars', 'cars')
      .select('COUNT(DISTINCT client.id)', 'count')
      .addSelect('COUNT(cars.id)', 'totalCars')
      .where('client.businessId = :businessId', { businessId })
      .andWhere('client.isActive = :isActive', { isActive: true })
      .andWhere('cars.isActive = :carActive', { carActive: true })
      .getRawOne();

    return {
      totalClients: parseInt(totalClientsResult.count) || 0,
      activeClients: parseInt(totalClientsResult.count) || 0, // All are active since we filter by isActive
      clientsWithCars: parseInt(clientsWithCarsResult.count) || 0,
      totalCars: parseInt(clientsWithCarsResult.totalCars) || 0,
    };
  }
}