import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, In, Between } from 'typeorm';
import { RepairSession } from '../entities/repair-session.entity';
import { Inspection } from '../entities/inspection.entity';
import { CreateRepairSessionInput, CreateInspectionInput, UpdateRepairSessionStatusInput } from '../dto/repair.input';
import { RepairSessionStatus, InspectionType } from '../enums/repair.enum';
import { Car } from '../entities/car.entity';
import { Business } from '../../business/entities/business.entity';
import { User } from '../../user/user.entity';

@Injectable()
export class RepairSessionService {
  constructor(
    @InjectRepository(RepairSession)
    private repairSessionRepository: Repository<RepairSession>,
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(input: CreateRepairSessionInput, userId: number): Promise<RepairSession> {
    // Validate car exists and belongs to the business
    const car = await this.carRepository.findOne({
      where: { id: input.carId },
      relations: ['client', 'client.business'],
    });
    
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    if (car.client.business.id !== input.businessId) {
      throw new ForbiddenException('Car does not belong to this business');
    }

    // Validate business exists
    const business = await this.businessRepository.findOne({
      where: { id: input.businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const repairSession = this.repairSessionRepository.create({
      ...input,
      status: RepairSessionStatus.CUSTOMER_REQUEST,
      car,
      business,
      createdBy: { id: userId } as User,
      sessionNumber: await this.generateSessionNumber(input.businessId),
    });

    return this.repairSessionRepository.save(repairSession);
  }

  async findAll(businessId: number, options?: FindManyOptions<RepairSession>): Promise<RepairSession[]> {
    return this.repairSessionRepository.find({
      where: { business: { id: businessId } },
      relations: ['car', 'car.client', 'business', 'createdBy', 'inspections', 'offers', 'jobCards'],
      order: { createdAt: 'DESC' },
      ...options,
    });
  }

  async findOne(id: number, businessId: number): Promise<RepairSession> {
    const repairSession = await this.repairSessionRepository.findOne({
      where: { id, business: { id: businessId } },
      relations: [
        'car', 'car.client', 'business', 'createdBy',
        'inspections', 'inspections.inspector', 'inspections.media',
        'offers', 'offers.items',
        'jobCards', 'jobCards.tasks', 'jobCards.tasks.parts'
      ],
    });

    if (!repairSession) {
      throw new NotFoundException('Repair session not found');
    }

    return repairSession;
  }

  async updateStatus(
    id: number,
    input: UpdateRepairSessionStatusInput,
    businessId: number,
    userId: number,
  ): Promise<RepairSession> {
    const repairSession = await this.findOne(id, businessId);

    // Validate status transition
    if (!this.isValidStatusTransition(repairSession.status, input.status)) {
      throw new BadRequestException(`Invalid status transition from ${repairSession.status} to ${input.status}`);
    }

    repairSession.status = input.status;
    repairSession.updatedAt = new Date();

    return this.repairSessionRepository.save(repairSession);
  }

  async getStatistics(businessId: number): Promise<any> {
    const totalSessions = await this.repairSessionRepository.count({
      where: { business: { id: businessId } },
    });

    const statusCounts = await this.repairSessionRepository
      .createQueryBuilder('session')
      .select('session.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('session.businessId = :businessId', { businessId })
      .groupBy('session.status')
      .getRawMany();

    const activeSessions = await this.repairSessionRepository.count({
      where: {
        business: { id: businessId },
        status: In([
          RepairSessionStatus.CUSTOMER_REQUEST,
          RepairSessionStatus.INITIAL_INSPECTION,
          RepairSessionStatus.TEST_DRIVE_INSPECTION,
          RepairSessionStatus.OFFER_PREPARATION,
          RepairSessionStatus.OFFER_SENT,
          RepairSessionStatus.JOB_CARD_CREATED,
          RepairSessionStatus.REPAIR_IN_PROGRESS,
        ]),
      },
    });

    return {
      totalSessions,
      activeSessions,
      statusBreakdown: statusCounts,
    };
  }

  private async generateSessionNumber(businessId: number): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repairSessionRepository.count({
      where: { 
        business: { id: businessId },
        createdAt: Between(new Date(year, 0, 1), new Date(year, 11, 31))
      },
    });

    return `RS-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private isValidStatusTransition(currentStatus: RepairSessionStatus, newStatus: RepairSessionStatus): boolean {
    const validTransitions: { [key in RepairSessionStatus]: RepairSessionStatus[] } = {
      [RepairSessionStatus.CUSTOMER_REQUEST]: [RepairSessionStatus.INITIAL_INSPECTION, RepairSessionStatus.CANCELLED],
      [RepairSessionStatus.INITIAL_INSPECTION]: [RepairSessionStatus.TEST_DRIVE_INSPECTION, RepairSessionStatus.OFFER_PREPARATION, RepairSessionStatus.CANCELLED],
      [RepairSessionStatus.TEST_DRIVE_INSPECTION]: [RepairSessionStatus.OFFER_PREPARATION, RepairSessionStatus.CANCELLED],
      [RepairSessionStatus.OFFER_PREPARATION]: [RepairSessionStatus.OFFER_SENT, RepairSessionStatus.CANCELLED],
      [RepairSessionStatus.OFFER_SENT]: [RepairSessionStatus.OFFER_APPROVED, RepairSessionStatus.OFFER_REJECTED, RepairSessionStatus.CANCELLED],
      [RepairSessionStatus.OFFER_APPROVED]: [RepairSessionStatus.JOB_CARD_CREATED, RepairSessionStatus.CANCELLED],
      [RepairSessionStatus.OFFER_REJECTED]: [RepairSessionStatus.OFFER_PREPARATION, RepairSessionStatus.CANCELLED],
      [RepairSessionStatus.JOB_CARD_CREATED]: [RepairSessionStatus.REPAIR_IN_PROGRESS, RepairSessionStatus.CANCELLED],
      [RepairSessionStatus.REPAIR_IN_PROGRESS]: [RepairSessionStatus.QUALITY_CHECK, RepairSessionStatus.CANCELLED],
      [RepairSessionStatus.QUALITY_CHECK]: [RepairSessionStatus.FINAL_INSPECTION, RepairSessionStatus.REPAIR_IN_PROGRESS],
      [RepairSessionStatus.FINAL_INSPECTION]: [RepairSessionStatus.READY_FOR_DELIVERY],
      [RepairSessionStatus.READY_FOR_DELIVERY]: [RepairSessionStatus.DELIVERED],
      [RepairSessionStatus.DELIVERED]: [],
      [RepairSessionStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}