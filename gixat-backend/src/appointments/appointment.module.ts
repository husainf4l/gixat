import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentService } from './services/appointment.service';
import { AppointmentResolver } from './resolvers/appointment.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  providers: [AppointmentService, AppointmentResolver],
  exports: [AppointmentService],
})
export class AppointmentModule {}