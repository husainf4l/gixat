import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionsService } from '../sessions/sessions.service';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return this.addBackwardCompatibilityFields(client);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    const result = await this.clientsService.findAll(
      page ? +page : 1,
      limit ? +limit : 50,
      search
    );
    
    // Add backward compatibility fields to each client
    const adaptedData = result.data.map(client => this.addBackwardCompatibilityFields(client));
    
    return {
      ...result,
      data: adaptedData
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const client = await this.clientsService.findOne(id);
    return this.addBackwardCompatibilityFields(client);
  }

  @Get(':id/sessions')
  async getClientSessions(@Param('id') id: string) {
    return this.sessionsService.findByCustomer(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    const client = await this.clientsService.update(id, updateClientDto);
    return this.addBackwardCompatibilityFields(client);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
  
  // Helper method to add backward compatibility fields
  private addBackwardCompatibilityFields(client: any) {
    return {
      ...client,
      // Map phone to mobileNumber for backward compatibility
      mobileNumber: client.phone,
      // Extract car model from the first car if available
      carModel: client.cars && client.cars.length > 0 ? 
        `${client.cars[0].make || ''} ${client.cars[0].model || ''}`.trim() : '',
      // Extract plate number from the first car if available
      plateNumber: client.cars && client.cars.length > 0 ? client.cars[0].plateNumber : null
    };
  }
}
