import { Injectable } from '@nestjs/common';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityLogType } from '@prisma/client';

@Injectable()
export class InspectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInspectionDto: CreateInspectionDto) {
    // Create the inspection
    const inspection = await this.prisma.inspection.create({
      data: {
        sessionId: createInspectionDto.sessionId,
        notes: createInspectionDto.notes,
        checklist: createInspectionDto.checklist,
        testDriveNotes: createInspectionDto.testDriveNotes,
      },
    });

    // Log the activity
    await this.prisma.activityLog.create({
      data: {
        type: ActivityLogType.INSPECTION_CREATED,
        description: 'Inspection created',
        sessionId: createInspectionDto.sessionId,
      },
    });

    return inspection;
  }

  async findAll() {
    return this.prisma.inspection.findMany();
  }

  async findBySession(sessionId: string) {
    return this.prisma.inspection.findUnique({
      where: { sessionId },
    });
  }

  async findOne(id: string) {
    return this.prisma.inspection.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateInspectionDto: UpdateInspectionDto) {
    const inspection = await this.prisma.inspection.update({
      where: { id },
      data: {
        notes: updateInspectionDto.notes,
        checklist: updateInspectionDto.checklist,
        testDriveNotes: updateInspectionDto.testDriveNotes,
      },
    });

    // Log the activity
    if (inspection.sessionId) {
      await this.prisma.activityLog.create({
        data: {
          type: ActivityLogType.INSPECTION_UPDATED,
          description: 'Inspection updated',
          sessionId: inspection.sessionId,
        },
      });
    }

    return inspection;
  }

  async remove(id: string) {
    return this.prisma.inspection.delete({
      where: { id },
    });
  }
}