import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';
import { NotificationResolver } from './resolvers/notification.resolver';
import { EmailProvider, SMSProvider, NotificationTemplateService } from './services/notification.providers';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [
    NotificationService,
    NotificationResolver,
    EmailProvider,
    SMSProvider,
    NotificationTemplateService,
  ],
  exports: [NotificationService, NotificationTemplateService],
})
export class NotificationModule implements OnModuleInit {
  constructor(
    private notificationService: NotificationService,
    private emailProvider: EmailProvider,
    private smsProvider: SMSProvider,
  ) {}

  async onModuleInit() {
    // Register notification providers
    this.notificationService.registerProvider(NotificationType.EMAIL, this.emailProvider);
    this.notificationService.registerProvider(NotificationType.SMS, this.smsProvider);
  }
}