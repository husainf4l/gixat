import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Inspection } from '../entities/inspection.entity';
import { Media } from '../entities/media.entity';
import { RepairSession } from '../entities/repair-session.entity';
import { CreateInspectionInput } from '../dto/repair.input';
import { InspectionType, MediaType } from '../enums/repair.enum';
import { User } from '../../user/user.entity';
import { AwsS3Service } from '../../aws-services/aws-s3.service';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(RepairSession)
    private repairSessionRepository: Repository<RepairSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private awsS3Service: AwsS3Service,
  ) {}

  async create(input: CreateInspectionInput, businessId: number): Promise<Inspection> {
    // Validate repair session exists and belongs to business
    const repairSession = await this.repairSessionRepository.findOne({
      where: { id: input.repairSessionId, business: { id: businessId } },
      relations: ['business'],
    });

    if (!repairSession) {
      throw new NotFoundException('Repair session not found');
    }

    // Validate inspector exists and belongs to business
    const inspector = await this.userRepository.findOne({
      where: { id: input.inspectorId },
      relations: ['userBusinesses', 'userBusinesses.business'],
    });

    if (!inspector || !inspector.userBusinesses.some(ub => ub.business.id === businessId)) {
      throw new ForbiddenException('Inspector not authorized for this business');
    }

    const inspection = this.inspectionRepository.create({
      ...input,
      repairSession,
      inspector,
    });

    return this.inspectionRepository.save(inspection);
  }

  async findAll(repairSessionId: number, businessId: number): Promise<Inspection[]> {
    return this.inspectionRepository.find({
      where: { 
        repairSession: { id: repairSessionId, business: { id: businessId } }
      },
      relations: ['inspector', 'media', 'repairSession'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number, businessId: number): Promise<Inspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { 
        id, 
        repairSession: { business: { id: businessId } }
      },
      relations: ['inspector', 'media', 'repairSession', 'repairSession.car', 'repairSession.car.client'],
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    return inspection;
  }

  async update(id: number, updates: Partial<Inspection>, businessId: number): Promise<Inspection> {
    const inspection = await this.findOne(id, businessId);
    
    Object.assign(inspection, updates);
    inspection.updatedAt = new Date();

    return this.inspectionRepository.save(inspection);
  }

  async addMedia(inspectionId: number, mediaFiles: any[], businessId: number): Promise<Media[]> {
    const inspection = await this.findOne(inspectionId, businessId);
    
    const mediaEntities: Media[] = [];
    
    for (const file of mediaFiles) {
      let filePath = file.path;
      
      // If it's a Buffer (base64 decoded), upload to S3
      if (Buffer.isBuffer(file.buffer) && file.filename) {
        try {
          filePath = await this.awsS3Service.uploadInspectionMedia(
            file.buffer,
            file.filename,
            inspectionId,
            businessId
          );
        } catch (error) {
          console.warn('Failed to upload to S3, using local path:', error);
          // Fallback to local path if S3 fails
        }
      }
      
      const mediaEntity = this.mediaRepository.create({
        filename: file.filename,
        originalName: file.originalname || file.filename,
        filePath: filePath,
        mimeType: file.mimetype,
        size: file.size,
        type: file.mimetype.startsWith('image/') ? MediaType.IMAGE : 
              file.mimetype.startsWith('video/') ? MediaType.VIDEO : 
              MediaType.DOCUMENT,
        inspection,
      });
      
      mediaEntities.push(mediaEntity);
    }

    return this.mediaRepository.save(mediaEntities);
  }

  async addMediaFromBase64(
    inspectionId: number, 
    base64File: string, 
    filename: string, 
    mimetype: string, 
    businessId: number
  ): Promise<Media> {
    const inspection = await this.findOne(inspectionId, businessId);
    
    // Decode base64 and upload to S3
    const buffer = Buffer.from(base64File, 'base64');
    const s3Url = await this.awsS3Service.uploadInspectionMedia(
      buffer,
      filename,
      inspectionId,
      businessId
    );
    
    const mediaEntity = this.mediaRepository.create({
      filename,
      originalName: filename,
      filePath: s3Url,
      mimeType: mimetype,
      size: buffer.length,
      type: mimetype.startsWith('image/') ? MediaType.IMAGE : 
            mimetype.startsWith('video/') ? MediaType.VIDEO : 
            MediaType.DOCUMENT,
      inspection,
    });

    return this.mediaRepository.save(mediaEntity);
  }

  async getInspectionsByType(repairSessionId: number, type: InspectionType, businessId: number): Promise<Inspection[]> {
    return this.inspectionRepository.find({
      where: {
        repairSession: { id: repairSessionId, business: { id: businessId } },
        type,
      },
      relations: ['inspector', 'media'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStatistics(businessId: number): Promise<any> {
    const totalInspections = await this.inspectionRepository.count({
      where: { repairSession: { business: { id: businessId } } },
    });

    const typeBreakdown = await this.inspectionRepository
      .createQueryBuilder('inspection')
      .select('inspection.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('inspection.repairSession', 'session')
      .where('session.businessId = :businessId', { businessId })
      .groupBy('inspection.type')
      .getRawMany();

    const passFailBreakdown = await this.inspectionRepository
      .createQueryBuilder('inspection')
      .select('inspection.passed', 'passed')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('inspection.repairSession', 'session')
      .where('session.businessId = :businessId', { businessId })
      .groupBy('inspection.passed')
      .getRawMany();

    return {
      totalInspections,
      typeBreakdown,
      passFailBreakdown,
    };
  }
}