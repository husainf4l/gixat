import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards
} from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateInspectionImageDto } from './dto/create-inspection-image.dto';

@Controller('inspection')
@UseGuards(JwtAuthGuard)
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Post()
  create(@Body() createInspectionDto: CreateInspectionDto) {
    return this.inspectionService.create(createInspectionDto);
  }

  @Get()
  findAll() {
    return this.inspectionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inspectionService.findOne(id);
  }

  @Get('session/:sessionId')
  findBySession(@Param('sessionId') sessionId: string) {
    return this.inspectionService.findBySession(sessionId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInspectionDto: UpdateInspectionDto) {
    return this.inspectionService.update(id, updateInspectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inspectionService.remove(id);
  }

  // New endpoints for managing inspection images
  @Post(':id/images')
  addImage(
    @Param('id') id: string,
    @Body() createImageDto: CreateInspectionImageDto,
  ) {
    return this.inspectionService.addImageToInspection(id, createImageDto);
  }

  @Delete('images/:imageId')
  removeImage(@Param('imageId') imageId: string) {
    return this.inspectionService.removeImage(imageId);
  }
}