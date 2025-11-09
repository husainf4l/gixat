import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { 
  CreateAppointmentInput, 
  UpdateAppointmentInput, 
  UpdateAppointmentStatusInput, 
  AppointmentFilterInput,
  AvailabilityCheckInput 
} from '../dto/appointment.input';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(input: CreateAppointmentInput, createdById: number): Promise<Appointment> {
    // Generate unique appointment number
    const appointmentNumber = await this.generateAppointmentNumber(input.businessId);
    
    // Check availability
    const isAvailable = await this.checkAvailability({
      date: input.scheduledDate,
      startTime: input.scheduledTime,
      duration: input.estimatedDuration || 60,
      businessId: input.businessId,
      technicianId: input.assignedTechnicianId,
    });

    if (!isAvailable) {
      throw new BadRequestException('Selected time slot is not available');
    }

    const appointment = this.appointmentRepository.create({
      ...input,
      appointmentNumber,
      createdById,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(filter: AppointmentFilterInput): Promise<Appointment[]> {
    const where: any = { businessId: filter.businessId };
    
    if (!filter.includeInactive) {
      where.isActive = true;
    }
    
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;
    if (filter.clientId) where.clientId = filter.clientId;
    if (filter.assignedTechnicianId) where.assignedTechnicianId = filter.assignedTechnicianId;
    
    if (filter.dateFrom && filter.dateTo) {
      where.scheduledDate = Between(new Date(filter.dateFrom), new Date(filter.dateTo));
    } else if (filter.dateFrom) {
      where.scheduledDate = new Date(filter.dateFrom);
    }

    return this.appointmentRepository.find({
      where,
      relations: ['client', 'car', 'assignedTechnician', 'createdBy', 'business'],
      order: { scheduledDate: 'ASC', scheduledTime: 'ASC' },
    });
  }

  async findOne(id: number, businessId: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, businessId, isActive: true },
      relations: ['client', 'car', 'assignedTechnician', 'createdBy', 'business'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: number, updates: UpdateAppointmentInput, businessId: number): Promise<Appointment> {
    const appointment = await this.findOne(id, businessId);

    // If rescheduling, check availability
    if (updates.scheduledDate || updates.scheduledTime || updates.estimatedDuration) {
      const isAvailable = await this.checkAvailability({
        date: updates.scheduledDate || appointment.scheduledDate.toISOString().split('T')[0],
        startTime: updates.scheduledTime || appointment.scheduledTime,
        duration: updates.estimatedDuration || appointment.estimatedDuration,
        businessId,
        technicianId: updates.assignedTechnicianId || appointment.assignedTechnicianId,
      }, id);

      if (!isAvailable) {
        throw new BadRequestException('Selected time slot is not available');
      }
    }

    Object.assign(appointment, updates);
    return this.appointmentRepository.save(appointment);
  }

  async updateStatus(id: number, statusUpdate: UpdateAppointmentStatusInput, businessId: number): Promise<Appointment> {
    const appointment = await this.findOne(id, businessId);

    appointment.status = statusUpdate.status;
    
    if (statusUpdate.status === AppointmentStatus.CONFIRMED) {
      appointment.confirmedAt = new Date();
    } else if (statusUpdate.status === AppointmentStatus.CANCELLED) {
      appointment.cancelledAt = new Date();
      if (statusUpdate.cancellationReason) {
        appointment.cancellationReason = statusUpdate.cancellationReason;
      }
    } else if (statusUpdate.status === AppointmentStatus.IN_PROGRESS) {
      appointment.actualStartTime = new Date();
    } else if (statusUpdate.status === AppointmentStatus.COMPLETED) {
      appointment.actualEndTime = new Date();
      if (statusUpdate.notes) {
        appointment.completionNotes = statusUpdate.notes;
      }
    }

    if (statusUpdate.notes && statusUpdate.status !== AppointmentStatus.COMPLETED) {
      appointment.internalNotes = statusUpdate.notes;
    }

    return this.appointmentRepository.save(appointment);
  }

  async checkAvailability(input: AvailabilityCheckInput, excludeAppointmentId?: number): Promise<boolean> {
    const startDateTime = new Date(`${input.date} ${input.startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (input.duration * 60000));

    const query = this.appointmentRepository.createQueryBuilder('appointment')
      .where('appointment.businessId = :businessId', { businessId: input.businessId })
      .andWhere('appointment.scheduledDate = :date', { date: input.date })
      .andWhere('appointment.isActive = true')
      .andWhere('appointment.status NOT IN (:...excludedStatuses)', { 
        excludedStatuses: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED] 
      });

    if (input.technicianId) {
      query.andWhere('appointment.assignedTechnicianId = :technicianId', { technicianId: input.technicianId });
    }

    if (excludeAppointmentId) {
      query.andWhere('appointment.id != :excludeId', { excludeId: excludeAppointmentId });
    }

    const conflictingAppointments = await query.getMany();

    for (const existing of conflictingAppointments) {
      const existingStart = new Date(`${existing.scheduledDate.toISOString().split('T')[0]} ${existing.scheduledTime}`);
      const existingEnd = new Date(existingStart.getTime() + (existing.estimatedDuration * 60000));

      // Check for time overlap
      if (
        (startDateTime >= existingStart && startDateTime < existingEnd) ||
        (endDateTime > existingStart && endDateTime <= existingEnd) ||
        (startDateTime <= existingStart && endDateTime >= existingEnd)
      ) {
        return false;
      }
    }

    return true;
  }

  async getAvailableTimeSlots(date: string, businessId: number, technicianId?: number): Promise<string[]> {
    const workingHours = { start: '08:00', end: '18:00' }; // Default working hours
    const slotDuration = 30; // 30-minute slots
    const timeSlots: string[] = [];

    // Generate all possible time slots
    const startTime = new Date(`${date} ${workingHours.start}`);
    const endTime = new Date(`${date} ${workingHours.end}`);

    for (let current = startTime; current < endTime; current.setMinutes(current.getMinutes() + slotDuration)) {
      const timeString = current.toTimeString().substring(0, 5);
      
      const isAvailable = await this.checkAvailability({
        date,
        startTime: timeString,
        duration: slotDuration,
        businessId,
        technicianId,
      });

      if (isAvailable) {
        timeSlots.push(timeString);
      }
    }

    return timeSlots;
  }

  async getTodaysAppointments(businessId: number): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return this.findAll({
      businessId,
      dateFrom: today,
      dateTo: today,
      includeInactive: false,
    });
  }

  async getUpcomingAppointments(businessId: number, days: number = 7): Promise<Appointment[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.findAll({
      businessId,
      dateFrom: today.toISOString().split('T')[0],
      dateTo: futureDate.toISOString().split('T')[0],
      includeInactive: false,
    });
  }

  async getOverdueAppointments(businessId: number): Promise<Appointment[]> {
    const appointments = await this.appointmentRepository.find({
      where: { 
        businessId, 
        isActive: true,
        status: AppointmentStatus.SCHEDULED,
      },
      relations: ['client', 'car'],
    });

    return appointments.filter(appointment => appointment.isOverdue);
  }

  async delete(id: number, businessId: number): Promise<boolean> {
    const appointment = await this.findOne(id, businessId);
    appointment.isActive = false;
    await this.appointmentRepository.save(appointment);
    return true;
  }

  async getStatistics(businessId: number): Promise<any> {
    const totalAppointments = await this.appointmentRepository.count({
      where: { businessId, isActive: true },
    });

    const statusBreakdown = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('appointment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('appointment.businessId = :businessId', { businessId })
      .andWhere('appointment.isActive = true')
      .groupBy('appointment.status')
      .getRawMany();

    const todaysAppointments = await this.getTodaysAppointments(businessId);
    const upcomingCount = await this.getUpcomingAppointments(businessId);
    const overdueCount = await this.getOverdueAppointments(businessId);

    return {
      totalAppointments,
      statusBreakdown,
      todayCount: todaysAppointments.length,
      upcomingCount: upcomingCount.length,
      overdueCount: overdueCount.length,
    };
  }

  private async generateAppointmentNumber(businessId: number): Promise<string> {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await this.appointmentRepository.count({
      where: { businessId, createdAt: new Date() },
    });
    
    return `APT-${businessId}-${today}-${String(count + 1).padStart(3, '0')}`;
  }
}