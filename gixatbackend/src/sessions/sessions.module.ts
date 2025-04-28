import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EntriesModule } from './entries/entries.module';
import { InspectionModule } from './inspection/inspection.module';

@Module({
  imports: [PrismaModule, EntriesModule, InspectionModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}