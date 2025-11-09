import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AppointmentService } from '../services/appointment.service';
import { Appointment } from '../entities/appointment.entity';
import { 
  CreateAppointmentInput, 
  UpdateAppointmentInput, 
  UpdateAppointmentStatusInput, 
  AppointmentFilterInput,
  AvailabilityCheckInput 
} from '../dto/appointment.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/user.entity';

@Resolver(() => Appointment)
@UseGuards(JwtAuthGuard)
export class AppointmentResolver {
  constructor(private appointmentService: AppointmentService) {}

  @Mutation(() => Appointment)
  async createAppointment(
    @Args('input') input: CreateAppointmentInput,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return this.appointmentService.create(input, user.id);
  }

  @Query(() => [Appointment])
  async appointments(
    @Args('filter') filter: AppointmentFilterInput,
    @CurrentUser() user: User,
  ): Promise<Appointment[]> {
    return this.appointmentService.findAll(filter);
  }

  @Query(() => Appointment)
  async appointment(
    @Args('id', { type: () => ID }) id: number,
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return this.appointmentService.findOne(id, businessId);
  }

  @Mutation(() => Appointment)
  async updateAppointment(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') input: UpdateAppointmentInput,
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return this.appointmentService.update(id, input, businessId);
  }

  @Mutation(() => Appointment)
  async updateAppointmentStatus(
    @Args('id', { type: () => ID }) id: number,
    @Args('input') input: UpdateAppointmentStatusInput,
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<Appointment> {
    return this.appointmentService.updateStatus(id, input, businessId);
  }

  @Query(() => Boolean)
  async checkAvailability(
    @Args('input') input: AvailabilityCheckInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.appointmentService.checkAvailability(input);
  }

  @Query(() => [String])
  async availableTimeSlots(
    @Args('date') date: string,
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('technicianId', { type: () => ID, nullable: true }) technicianId?: number,
    @CurrentUser() user?: User,
  ): Promise<string[]> {
    return this.appointmentService.getAvailableTimeSlots(date, businessId, technicianId);
  }

  @Query(() => [Appointment])
  async todaysAppointments(
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<Appointment[]> {
    return this.appointmentService.getTodaysAppointments(businessId);
  }

  @Query(() => [Appointment])
  async upcomingAppointments(
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('days', { type: () => ID, defaultValue: 7 }) days: number,
    @CurrentUser() user: User,
  ): Promise<Appointment[]> {
    return this.appointmentService.getUpcomingAppointments(businessId, days);
  }

  @Query(() => [Appointment])
  async overdueAppointments(
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<Appointment[]> {
    return this.appointmentService.getOverdueAppointments(businessId);
  }

  @Mutation(() => Boolean)
  async deleteAppointment(
    @Args('id', { type: () => ID }) id: number,
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.appointmentService.delete(id, businessId);
  }

  @Query(() => String, { name: 'appointmentStatistics' })
  async getAppointmentStatistics(
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<string> {
    const stats = await this.appointmentService.getStatistics(businessId);
    return JSON.stringify(stats);
  }
}