import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus, NotificationType, NotificationTemplate } from '../entities/notification.entity';
import { CreateNotificationInput, SendBulkNotificationInput, NotificationFilterInput } from '../dto/notification.input';

export interface NotificationProvider {
  sendEmail(to: string, subject: string, content: string, metadata?: any): Promise<boolean>;
  sendSMS(to: string, content: string, metadata?: any): Promise<boolean>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private providers: Map<NotificationType, NotificationProvider> = new Map();

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  // Register notification providers (email, SMS services)
  registerProvider(type: NotificationType, provider: NotificationProvider): void {
    this.providers.set(type, provider);
    this.logger.log(`Registered ${type} notification provider`);
  }

  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const notification = this.notificationRepository.create(input);
    return this.notificationRepository.save(notification);
  }

  async sendNotification(notificationId: number): Promise<boolean> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    const provider = this.providers.get(notification.type);
    if (!provider) {
      await this.updateNotificationStatus(
        notificationId,
        NotificationStatus.FAILED,
        `No provider registered for ${notification.type}`
      );
      return false;
    }

    try {
      let success = false;
      
      if (notification.type === NotificationType.EMAIL) {
        success = await provider.sendEmail(
          notification.recipient,
          notification.subject,
          notification.content,
          notification.metadata
        );
      } else if (notification.type === NotificationType.SMS) {
        success = await provider.sendSMS(
          notification.recipient,
          notification.content,
          notification.metadata
        );
      }

      await this.updateNotificationStatus(
        notificationId,
        success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        success ? undefined : 'Provider returned failure'
      );

      return success;
    } catch (error) {
      await this.updateNotificationStatus(
        notificationId,
        NotificationStatus.FAILED,
        error.message
      );
      this.logger.error(`Failed to send notification ${notificationId}:`, error);
      return false;
    }
  }

  async sendBulkNotifications(input: SendBulkNotificationInput): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const recipient of input.recipients) {
      const notification = await this.createNotification({
        type: input.type,
        template: input.template,
        recipient,
        subject: input.subject,
        content: input.content,
        businessId: input.businessId,
        metadata: input.metadata,
      });

      notifications.push(notification);
      
      // Send notification asynchronously
      this.sendNotification(notification.id).catch(error => 
        this.logger.error(`Failed to send bulk notification ${notification.id}:`, error)
      );
    }

    return notifications;
  }

  async findNotifications(filter: NotificationFilterInput): Promise<Notification[]> {
    const where: any = { businessId: filter.businessId };
    
    if (filter.type) where.type = filter.type;
    if (filter.template) where.template = filter.template;
    if (filter.recipient) where.recipient = filter.recipient;

    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  private async updateNotificationStatus(
    id: number,
    status: NotificationStatus,
    errorMessage?: string
  ): Promise<void> {
    const updates: any = { status };
    
    if (status === NotificationStatus.SENT) {
      updates.sentAt = new Date();
    } else if (status === NotificationStatus.DELIVERED) {
      updates.deliveredAt = new Date();
    }
    
    if (errorMessage) {
      updates.errorMessage = errorMessage;
    }

    await this.notificationRepository.update(id, updates);
  }

  // Template-based notification methods
  async sendRepairStatusUpdate(
    repairSessionId: number,
    businessId: number,
    recipient: string,
    statusMessage: string,
    type: NotificationType = NotificationType.EMAIL
  ): Promise<Notification> {
    const notification = await this.createNotification({
      type,
      template: NotificationTemplate.REPAIR_STATUS_UPDATE,
      recipient,
      subject: 'Repair Status Update',
      content: statusMessage,
      relatedEntityType: 'repair_session',
      relatedEntityId: repairSessionId,
      businessId,
    });

    this.sendNotification(notification.id);
    return notification;
  }

  async sendOfferNotification(
    offerId: number,
    businessId: number,
    recipient: string,
    offerDetails: string,
    type: NotificationType = NotificationType.EMAIL
  ): Promise<Notification> {
    const notification = await this.createNotification({
      type,
      template: NotificationTemplate.OFFER_READY,
      recipient,
      subject: 'Repair Quote Ready',
      content: offerDetails,
      relatedEntityType: 'offer',
      relatedEntityId: offerId,
      businessId,
    });

    this.sendNotification(notification.id);
    return notification;
  }

  async sendReadyForPickupNotification(
    repairSessionId: number,
    businessId: number,
    recipient: string,
    pickupMessage: string,
    type: NotificationType = NotificationType.EMAIL
  ): Promise<Notification> {
    const notification = await this.createNotification({
      type,
      template: NotificationTemplate.READY_FOR_PICKUP,
      recipient,
      subject: 'Vehicle Ready for Pickup',
      content: pickupMessage,
      relatedEntityType: 'repair_session',
      relatedEntityId: repairSessionId,
      businessId,
    });

    this.sendNotification(notification.id);
    return notification;
  }

  async sendInsuranceExpiryReminder(
    carId: number,
    businessId: number,
    recipient: string,
    reminderMessage: string,
    type: NotificationType = NotificationType.EMAIL
  ): Promise<Notification> {
    const notification = await this.createNotification({
      type,
      template: NotificationTemplate.INSURANCE_EXPIRY,
      recipient,
      subject: 'Insurance Expiry Reminder',
      content: reminderMessage,
      relatedEntityType: 'car',
      relatedEntityId: carId,
      businessId,
    });

    this.sendNotification(notification.id);
    return notification;
  }

  async getNotificationStats(businessId: number): Promise<any> {
    const totalSent = await this.notificationRepository.count({
      where: { businessId, status: NotificationStatus.SENT },
    });

    const totalFailed = await this.notificationRepository.count({
      where: { businessId, status: NotificationStatus.FAILED },
    });

    const byType = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.businessId = :businessId', { businessId })
      .groupBy('notification.type')
      .getRawMany();

    return {
      totalSent,
      totalFailed,
      byType,
    };
  }
}