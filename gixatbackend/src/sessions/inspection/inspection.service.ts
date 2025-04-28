import { Injectable } from '@nestjs/common';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityLogType, Prisma } from '@prisma/client';
import { CreateInspectionImageDto } from './dto/create-inspection-image.dto';
import { InspectionImage } from './inspection-image.interface';

@Injectable()
export class InspectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInspectionDto: CreateInspectionDto) {
    // Extract images from the DTO
    const { images, ...inspectionData } = createInspectionDto;
    
    // Create the inspection first
    const createdInspection = await this.prisma.inspection.create({
      data: {
        sessionId: inspectionData.sessionId,
        notes: inspectionData.notes,
        checklist: inspectionData.checklist,
        testDriveNotes: inspectionData.testDriveNotes,
      },
    });
    
    // Create inspection images if provided
    if (images && images.length > 0) {
      // Use raw SQL to create images since the client might not be generated yet
      for (const image of images) {
        await this.prisma.$executeRaw`
          INSERT INTO "inspection_images" ("id", "imageUrl", "description", "inspectionId", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${image.imageUrl}, ${image.description}, ${createdInspection.id}, NOW(), NOW())
        `;
      }
    }
    
    // Log the activity
    await this.prisma.activityLog.create({
      data: {
        type: ActivityLogType.INSPECTION_CREATED,
        description: 'Inspection created',
        sessionId: inspectionData.sessionId,
      },
    });
    
    return this.findOne(createdInspection.id);
  }

  async findAll() {
    const inspections = await this.prisma.inspection.findMany();
    
    // Manually fetch images for each inspection
    for (const inspection of inspections) {
      const images = await this.prisma.$queryRaw<InspectionImage[]>`
        SELECT * FROM "inspection_images" WHERE "inspectionId" = ${inspection.id}
      `;
      (inspection as any).images = images || [];
    }
    
    return inspections;
  }

  async findBySession(sessionId: string) {

    console.log('Finding inspection by session ID:', sessionId);
    let inspection = await this.prisma.inspection.findUnique({
      where: { sessionId },
    });
    
    // If no inspection exists for this session, create an empty one
    if (!inspection) {
      inspection = await this.prisma.inspection.create({
        data: {
          sessionId,
          notes: '',
          checklist: {},
          testDriveNotes: '',
        },
      });
      
      // Log the activity
      await this.prisma.activityLog.create({
        data: {
          type: ActivityLogType.INSPECTION_CREATED,
          description: 'Empty inspection created',
          sessionId,
        },
      });
    }
    
    // Fetch related images
    const images = await this.prisma.$queryRaw<InspectionImage[]>`
      SELECT * FROM "inspection_images" WHERE "inspectionId" = ${inspection.id}
    `;
    (inspection as any).images = images || [];
    
    return inspection;
  }

  async findOne(id: string) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
    });
    
    if (inspection) {
      const images = await this.prisma.$queryRaw<InspectionImage[]>`
        SELECT * FROM "inspection_images" WHERE "inspectionId" = ${inspection.id}
      `;
      (inspection as any).images = images || [];
    }
    
    return inspection;
  }

  async update(id: string, updateInspectionDto: UpdateInspectionDto) {
    // Extract images from the DTO if present
    const { images, ...inspectionData } = updateInspectionDto as any;
    
    // Update the inspection
    const updatedInspection = await this.prisma.inspection.update({
      where: { id },
      data: {
        notes: inspectionData.notes,
        checklist: inspectionData.checklist,
        testDriveNotes: inspectionData.testDriveNotes,
      },
    });
    
    // Handle images if provided
    if (images && images.length > 0) {
      // First, delete existing images
      await this.prisma.$executeRaw`DELETE FROM "inspection_images" WHERE "inspectionId" = ${id}`;
      
      // Then create new images
      for (const image of images) {
        await this.prisma.$executeRaw`
          INSERT INTO "inspection_images" ("id", "imageUrl", "description", "inspectionId", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${image.imageUrl}, ${image.description}, ${id}, NOW(), NOW())
        `;
      }
    }
    
    // Log the activity
    if (updatedInspection.sessionId) {
      await this.prisma.activityLog.create({
        data: {
          type: ActivityLogType.INSPECTION_UPDATED,
          description: 'Inspection updated',
          sessionId: updatedInspection.sessionId,
        },
      });
    }
    
    return this.findOne(id);
  }

  async remove(id: string) {
    // First delete related images
    await this.prisma.$executeRaw`DELETE FROM "inspection_images" WHERE "inspectionId" = ${id}`;
    
    // Then delete the inspection
    return this.prisma.inspection.delete({
      where: { id },
    });
  }
  
  // Methods specifically for handling inspection images
  async addImageToInspection(inspectionId: string, imageDto: CreateInspectionImageDto) {
    // Use raw SQL to insert the image
    const result = await this.prisma.$queryRaw<InspectionImage[]>`
      INSERT INTO "inspection_images" ("id", "imageUrl", "description", "inspectionId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${imageDto.imageUrl}, ${imageDto.description}, ${inspectionId}, NOW(), NOW())
      RETURNING *
    `;
    
    const image = result[0];
    
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
    });
    
    if (inspection?.sessionId) {
      await this.prisma.activityLog.create({
        data: {
          type: ActivityLogType.INSPECTION_UPDATED,
          description: 'Inspection image added',
          sessionId: inspection.sessionId,
        },
      });
    }
    
    return image;
  }
  
  async removeImage(imageId: string) {
    // First get the image to find the related inspection
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT i.*, insp."sessionId"
      FROM "inspection_images" i
      JOIN "inspections" insp ON i."inspectionId" = insp.id
      WHERE i.id = ${imageId}
    `;
    
    if (!result || result.length === 0) {
      return null;
    }
    
    const image = result[0];
    
    // Delete the image
    await this.prisma.$executeRaw`DELETE FROM "inspection_images" WHERE id = ${imageId}`;
    
    // Log the activity
    if (image.sessionId) {
      await this.prisma.activityLog.create({
        data: {
          type: ActivityLogType.INSPECTION_UPDATED,
          description: 'Inspection image removed',
          sessionId: image.sessionId,
        },
      });
    }
    
    return { id: imageId, deleted: true };
  }
}