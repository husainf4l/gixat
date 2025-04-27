import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    try {
      // Using a transaction to ensure both operations succeed or fail together
      return await this.prisma.$transaction(async (tx) => {
        // Create the customer
        const customer = await tx.customer.create({
          data: {
            name: createClientDto.name,
            phone: createClientDto.mobileNumber, // Match schema field names
            // Use the garageId from the DTO
            garageId: createClientDto.garageId,
            // Add optional fields if present
            email: createClientDto.email,
            address: createClientDto.address,
            notes: createClientDto.contactPerson ? `Contact: ${createClientDto.contactPerson}` : undefined,
          },
        });
        
        // Create the associated car with more structured data
        const car = await tx.car.create({
          data: {
            // Parse car model to get make and model separately
            make: this.extractMake(createClientDto.carModel),
            model: this.extractModel(createClientDto.carModel),
            year: createClientDto.year || new Date().getFullYear(),
            plateNumber: createClientDto.plateNumber,
            color: createClientDto.color || null,
            customerId: customer.id,
            garageId: createClientDto.garageId, // Use the same garageId
          }
        });
        
        // Return the customer with cars, but without duplicating data
        return {
          ...customer,
          cars: [car]
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors with more detail
        console.error('Prisma error:', error.message, error.code);
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[];
          if (target?.includes('plateNumber')) {
            throw new BadRequestException('A vehicle with this plate number already exists.');
          } else if (target?.includes('phone')) {
            throw new BadRequestException('A client with this mobile number already exists.');
          }
        }
      }
      throw new BadRequestException(`Failed to create client: ${error.message}`);
    }
  }

  async findAll(page = 1, limit = 50, search?: string) {
    // Adding pagination and basic search functionality
    const skip = (page - 1) * limit;
    
    // Properly typed Prisma where condition
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search } },
        { cars: { some: { plateNumber: { contains: search, mode: 'insensitive' as const } } } }
      ]
    } : {};
    
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          cars: true // Include cars in the response
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      this.prisma.customer.count({ where })
    ]);
    
    // Return customers with their cars without duplicating data
    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        cars: true // Include cars in the response
      }
    });
    
    if (!customer) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    
    // Return the customer with cars but no duplicated data
    return customer;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    try {
      // First check if customer exists
      const customer = await this.prisma.customer.findUnique({
        where: { id },
        include: { cars: true }
      });
      
      if (!customer) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      
      return await this.prisma.$transaction(async (tx) => {
        // Update customer info
        const updatedCustomer = await tx.customer.update({
          where: { id },
          data: {
            name: updateClientDto.name,
            phone: updateClientDto.mobileNumber, // Match schema field names
          },
          include: {
            cars: true
          }
        });
        
        // If we have car-specific updates and there's a primary car
        if ((updateClientDto.carModel || updateClientDto.color || updateClientDto.mileage || updateClientDto.year) && customer.cars.length > 0) {
          // Update the first/primary car
          const primaryCar = customer.cars[0];
          
          await tx.car.update({
            where: { id: primaryCar.id },
            data: {
              ...(updateClientDto.carModel && {
                make: this.extractMake(updateClientDto.carModel),
                model: this.extractModel(updateClientDto.carModel)
              }),
              ...(updateClientDto.plateNumber && { plateNumber: updateClientDto.plateNumber }),
              ...(updateClientDto.color && { color: updateClientDto.color }),
              ...(updateClientDto.year && { year: updateClientDto.year })
            }
          });
        }
        
        // Get the updated customer with cars
        return await tx.customer.findUnique({
          where: { id },
          include: { cars: true }
        });
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
      // Check if customer exists first
      const customer = await this.prisma.customer.findUnique({
        where: { id }
      });
      
      if (!customer) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      
      // Delete the customer - this will cascade delete related cars based on your schema
      return await this.prisma.customer.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete client: ${error.message}`);
    }
  }
  
  // Helper methods to extract make and model from a combined string
  private extractMake(carModel: string): string {
    const parts = carModel.trim().split(' ');
    return parts[0] || 'Unknown';
  }
  
  private extractModel(carModel: string): string {
    const parts = carModel.trim().split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : carModel;
  }
}
