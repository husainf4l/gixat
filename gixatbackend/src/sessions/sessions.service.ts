import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session, SessionStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    return this.prisma.session.create({
      data: {
        ...createSessionDto,
        status: createSessionDto.status || SessionStatus.OPEN,
      },
    });
  }

  async findAll(garageId?: string): Promise<Session[]> {
    const where = garageId ? { garageId } : undefined;
    
    return this.prisma.session.findMany({
      where,
      include: {
        customer: true,
        car: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        customer: true,
        car: true,
        entries: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        inspection: true,
        preJobcard: true,
        quotation: true,
        jobcard: true,
        aiCarData: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    try {
      return await this.prisma.session.update({
        where: { id },
        data: updateSessionDto,
      });
    } catch (error) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
  }

  async updateStatus(id: string, status: SessionStatus): Promise<Session> {
    try {
      return await this.prisma.session.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<Session> {
    try {
      return await this.prisma.session.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
  }

  async findByCustomer(customerId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { customerId },
      include: {
        car: true,
        entries: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByCar(carId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { carId },
      include: {
        customer: true,
        entries: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}