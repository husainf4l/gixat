import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Put
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionStatus } from '@prisma/client';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Get()
  findAll(@Query('garageId') garageId?: string) {
    return this.sessionsService.findAll(garageId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: SessionStatus
  ) {
    return this.sessionsService.updateStatus(id, status);
  }

  @Put(':id/status')
  updateStatusPut(
    @Param('id') id: string, 
    @Body('status') status: SessionStatus
  ) {
    return this.sessionsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessionsService.remove(id);
  }

  @Get('clients/:clientId')
  findByCustomer(@Param('clientId') customerId: string) {
    return this.sessionsService.findByCustomer(customerId);
  }

  @Get('car/:carId')
  findByCar(@Param('carId') carId: string) {
    return this.sessionsService.findByCar(carId);
  }
}