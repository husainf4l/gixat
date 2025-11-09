import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from './entities/technician.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Technician])],
  providers: [],
  exports: [],
})
export class TechnicianModule {}