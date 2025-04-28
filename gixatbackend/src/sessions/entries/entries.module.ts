import { Module } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EntriesService],
  exports: [EntriesService]
})
export class EntriesModule {}