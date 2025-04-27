import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    try {
      // Map DTO fields to Prisma schema fields
      const clientData = {
        name: createClientDto.name,
        mobileNumber: createClientDto.mobileNumber,
        carModel: createClientDto.carModel,
        plateNumber: createClientDto.plateNumber,
        // Fields from the Prisma schema
        status: 'ACTIVE' as const, // Using a type assertion to match the ClientStatus enum
        // Create associated vehicle
        vehicles: {
          create: {
            make: createClientDto.carModel.split(' ')[0] || 'Unknown',
            model: createClientDto.carModel,
            year: createClientDto.year || new Date().getFullYear(),
            licensePlate: createClientDto.plateNumber,
            // Optional vehicle fields
            color: createClientDto.color || null,
            mileage: createClientDto.mileage || null,
          }
        }
      };

      return this.prisma.client.create({
        data: clientData,
        include: {
          vehicles: true // Include the created vehicle in the response
        }
      });
    } catch (error) {
      throw new BadRequestException(`Failed to create client: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.client.findMany({
      include: {
        vehicles: true // Include vehicles in the response
      }
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        vehicles: true, // Include vehicles in the response
        serviceJobs: true, // Include service jobs
        Appointment: true // Include appointments
      }
    });
    
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    try {
      // First check if client exists
      const client = await this.prisma.client.findUnique({
        where: { id }
      });
      
      if (!client) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      
      // Extract only the fields that belong to the Client model
      const { carModel, plateNumber, ...clientData } = updateClientDto;
      
      // Update the client
      return await this.prisma.client.update({
        where: { id },
        data: clientData,
        include: {
          vehicles: true
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update client: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      // Check if client exists first
      const client = await this.prisma.client.findUnique({
        where: { id }
      });
      
      if (!client) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      
      // Delete the client - this will cascade delete related vehicles based on your schema
      return await this.prisma.client.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete client: ${error.message}`);
    }
  }
}
