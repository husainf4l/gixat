import { Module } from '@nestjs/common';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { ClientsModule } from '../clients/clients.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { ClientRegistrationAgentService } from './agents/client-registration-agent.service';
import { CustomerRequestAgentService } from './agents/customer-request-agent.service';
import { JobCardAgentService } from './agents/job-card-agent.service';
import { IssueExplanationAgentService } from './agents/issue-explanation-agent.service';

@Module({
  imports: [
    ClientsModule, // Import clients module to use its service
    PrismaModule,  // Import Prisma for database access
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for uploaded images
      },
    }),
  ],
  controllers: [AiChatController],
  providers: [
    AiChatService,
    ClientRegistrationAgentService,
    CustomerRequestAgentService,
    JobCardAgentService,
    IssueExplanationAgentService
  ],
  exports: [AiChatService],
})
export class AiChatModule {}