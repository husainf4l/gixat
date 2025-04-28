import { Module } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EntriesController } from './entries.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [EntriesController],
  providers: [EntriesService],
  exports: [EntriesService]
})
export class EntriesModule {}