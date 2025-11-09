import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { JobCard } from '../entities/job-card.entity';
import { JobTask } from '../entities/job-task.entity';
import { Part } from '../entities/part.entity';
import { RepairSession } from '../entities/repair-session.entity';
import { 
  CreateJobCardInput, 
  CreateJobTaskInput, 
  CreatePartInput,
  UpdateJobTaskStatusInput,
  UpdatePartStatusInput
} from '../dto/repair.input';
import { JobStatus, PartStatus } from '../enums/repair.enum';
import { User } from '../../user/user.entity';

@Injectable()
export class JobCardService {
  constructor(
    @InjectRepository(JobCard)
    private jobCardRepository: Repository<JobCard>,
    @InjectRepository(JobTask)
    private jobTaskRepository: Repository<JobTask>,
    @InjectRepository(Part)
    private partRepository: Repository<Part>,
    @InjectRepository(RepairSession)
    private repairSessionRepository: Repository<RepairSession>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createJobCard(input: CreateJobCardInput, businessId: number, createdById: number): Promise<JobCard> {
    // Validate repair session exists and belongs to business
    const repairSession = await this.repairSessionRepository.findOne({
      where: { id: input.repairSessionId, business: { id: businessId } },
      relations: ['business'],
    });

    if (!repairSession) {
      throw new NotFoundException('Repair session not found');
    }

    // Validate technician exists and belongs to business
    const technician = await this.userRepository.findOne({
      where: { id: input.assignedTechnicianId },
      relations: ['userBusinesses', 'userBusinesses.business'],
    });

    if (!technician || !technician.userBusinesses.some(ub => ub.business.id === businessId)) {
      throw new ForbiddenException('Technician not authorized for this business');
    }

    const jobCard = this.jobCardRepository.create({
      ...input,
      repairSession,
      assignedTechnician: technician,
      createdBy: { id: createdById } as User,
      jobNumber: await this.generateJobCardNumber(businessId),
    });

    return this.jobCardRepository.save(jobCard);
  }

  async createTask(input: CreateJobTaskInput, businessId: number): Promise<JobTask> {
    // Validate job card exists and belongs to business
    const jobCard = await this.jobCardRepository.findOne({
      where: { id: input.jobCardId, repairSession: { business: { id: businessId } } },
      relations: ['repairSession', 'repairSession.business'],
    });

    if (!jobCard) {
      throw new NotFoundException('Job card not found');
    }

    // Validate technician exists and belongs to business
    const technician = await this.userRepository.findOne({
      where: { id: input.assignedTechnicianId },
      relations: ['userBusinesses', 'userBusinesses.business'],
    });

    if (!technician || !technician.userBusinesses.some(ub => ub.business.id === businessId)) {
      throw new ForbiddenException('Technician not authorized for this business');
    }

    const jobTask = this.jobTaskRepository.create({
      ...input,
      jobCard,
      assignedTechnician: technician,
    });

    return this.jobTaskRepository.save(jobTask);
  }

  async createPart(input: CreatePartInput, businessId: number): Promise<Part> {
    // Validate job task exists and belongs to business
    const jobTask = await this.jobTaskRepository.findOne({
      where: { 
        id: input.jobTaskId,
        jobCard: { repairSession: { business: { id: businessId } } }
      },
      relations: ['jobCard', 'jobCard.repairSession', 'jobCard.repairSession.business'],
    });

    if (!jobTask) {
      throw new NotFoundException('Job task not found');
    }

    const part = this.partRepository.create({
      ...input,
      jobTask,
      totalPrice: input.quantity * input.unitPrice,
    });

    return this.partRepository.save(part);
  }

  async updateTaskStatus(
    taskId: number, 
    input: UpdateJobTaskStatusInput, 
    businessId: number,
    userId: number
  ): Promise<JobTask> {
    const jobTask = await this.jobTaskRepository.findOne({
      where: { 
        id: taskId,
        jobCard: { repairSession: { business: { id: businessId } } }
      },
      relations: ['jobCard', 'jobCard.repairSession', 'jobCard.repairSession.business'],
    });

    if (!jobTask) {
      throw new NotFoundException('Job task not found');
    }

    // Update task status and details
    Object.assign(jobTask, input);
    jobTask.updatedAt = new Date();

    if (input.status === JobStatus.COMPLETED && input.actualHours) {
      jobTask.completedAt = new Date();
    }

    const updatedTask = await this.jobTaskRepository.save(jobTask);

    // Update job card status based on task statuses
    await this.updateJobCardStatus(jobTask.jobCard.id);

    return updatedTask;
  }

  async updatePartStatus(
    partId: number, 
    input: UpdatePartStatusInput, 
    businessId: number
  ): Promise<Part> {
    const part = await this.partRepository.findOne({
      where: { 
        id: partId,
        jobTask: { 
          jobCard: { repairSession: { business: { id: businessId } } }
        }
      },
      relations: ['jobTask', 'jobTask.jobCard', 'jobTask.jobCard.repairSession', 'jobTask.jobCard.repairSession.business'],
    });

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    Object.assign(part, input);
    part.updatedAt = new Date();

    return this.partRepository.save(part);
  }

  async findJobCards(businessId: number): Promise<JobCard[]> {
    return this.jobCardRepository.find({
      where: { repairSession: { business: { id: businessId } } },
      relations: [
        'repairSession',
        'repairSession.car',
        'repairSession.car.client',
        'assignedTechnician',
        'tasks',
        'tasks.parts'
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findJobCard(id: number, businessId: number): Promise<JobCard> {
    const jobCard = await this.jobCardRepository.findOne({
      where: { id, repairSession: { business: { id: businessId } } },
      relations: [
        'repairSession',
        'repairSession.car',
        'repairSession.car.client',
        'assignedTechnician',
        'createdBy',
        'tasks',
        'tasks.assignedTechnician',
        'tasks.parts'
      ],
    });

    if (!jobCard) {
      throw new NotFoundException('Job card not found');
    }

    return jobCard;
  }

  async getJobCardStatistics(businessId: number): Promise<any> {
    const totalJobCards = await this.jobCardRepository.count({
      where: { repairSession: { business: { id: businessId } } },
    });

    const statusBreakdown = await this.jobCardRepository
      .createQueryBuilder('jobCard')
      .select('jobCard.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('jobCard.repairSession', 'session')
      .where('session.businessId = :businessId', { businessId })
      .groupBy('jobCard.status')
      .getRawMany();

    const taskStatistics = await this.jobTaskRepository
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('task.jobCard', 'jobCard')
      .innerJoin('jobCard.repairSession', 'session')
      .where('session.businessId = :businessId', { businessId })
      .groupBy('task.status')
      .getRawMany();

    return {
      totalJobCards,
      statusBreakdown,
      taskStatistics,
    };
  }

  private async updateJobCardStatus(jobCardId: number): Promise<void> {
    const jobCard = await this.jobCardRepository.findOne({
      where: { id: jobCardId },
      relations: ['tasks'],
    });

    if (!jobCard || !jobCard.tasks.length) return;

    const taskStatuses = jobCard.tasks.map(task => task.status);
    
    let newStatus: JobStatus;
    
    if (taskStatuses.every(status => status === JobStatus.COMPLETED)) {
      newStatus = JobStatus.COMPLETED;
    } else if (taskStatuses.some(status => status === JobStatus.IN_PROGRESS)) {
      newStatus = JobStatus.IN_PROGRESS;
    } else if (taskStatuses.some(status => status === JobStatus.ON_HOLD)) {
      newStatus = JobStatus.ON_HOLD;
    } else {
      newStatus = JobStatus.PENDING;
    }

    if (jobCard.status !== newStatus) {
      await this.jobCardRepository.update(jobCardId, {
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === JobStatus.COMPLETED ? { completedAt: new Date() } : {}),
      });
    }
  }

  private async generateJobCardNumber(businessId: number): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.jobCardRepository.count({
      where: { 
        repairSession: { business: { id: businessId } },
        createdAt: Between(new Date(year, 0, 1), new Date(year, 11, 31))
      },
    });

    return `JC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}