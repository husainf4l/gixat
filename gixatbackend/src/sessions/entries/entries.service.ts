import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';

@Injectable()
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  async create(createEntryDto: CreateEntryDto) {
    return this.prisma.sessionEntry.create({
      data: {
        type: createEntryDto.type,
        originalMessage: createEntryDto.originalMessage,
        cleanedMessage: createEntryDto.cleanedMessage,
        photoUrl: createEntryDto.photoUrl,
        audioUrl: createEntryDto.audioUrl,
        createdById: createEntryDto.createdById,
        session: {
          connect: { id: createEntryDto.sessionId }
        }
      }
    });
  }

  async findAll(sessionId: string) {
    return this.prisma.sessionEntry.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.sessionEntry.findUnique({
      where: { id }
    });
  }

  async remove(id: string) {
    return this.prisma.sessionEntry.delete({
      where: { id }
    });
  }
}