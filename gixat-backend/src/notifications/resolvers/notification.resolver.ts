import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { Notification, NotificationType } from '../entities/notification.entity';
import { CreateNotificationInput, SendBulkNotificationInput, NotificationFilterInput } from '../dto/notification.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/user.entity';

@Resolver(() => Notification)
@UseGuards(JwtAuthGuard)
export class NotificationResolver {
  constructor(private notificationService: NotificationService) {}

  @Mutation(() => Notification)
  async createNotification(
    @Args('input') input: CreateNotificationInput,
    @CurrentUser() user: User,
  ): Promise<Notification> {
    return this.notificationService.createNotification(input);
  }

  @Mutation(() => [Notification])
  async sendBulkNotifications(
    @Args('input') input: SendBulkNotificationInput,
    @CurrentUser() user: User,
  ): Promise<Notification[]> {
    return this.notificationService.sendBulkNotifications(input);
  }

  @Mutation(() => Boolean)
  async sendNotification(
    @Args('notificationId', { type: () => ID }) notificationId: number,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.notificationService.sendNotification(notificationId);
  }

  @Mutation(() => Notification)
  async sendRepairStatusUpdate(
    @Args('repairSessionId', { type: () => ID }) repairSessionId: number,
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('recipient') recipient: string,
    @Args('statusMessage') statusMessage: string,
    @Args('type', { type: () => NotificationType, defaultValue: NotificationType.EMAIL }) type: NotificationType,
    @CurrentUser() user: User,
  ): Promise<Notification> {
    return this.notificationService.sendRepairStatusUpdate(
      repairSessionId,
      businessId,
      recipient,
      statusMessage,
      type
    );
  }

  @Mutation(() => Notification)
  async sendOfferNotification(
    @Args('offerId', { type: () => ID }) offerId: number,
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('recipient') recipient: string,
    @Args('offerDetails') offerDetails: string,
    @Args('type', { type: () => NotificationType, defaultValue: NotificationType.EMAIL }) type: NotificationType,
    @CurrentUser() user: User,
  ): Promise<Notification> {
    return this.notificationService.sendOfferNotification(
      offerId,
      businessId,
      recipient,
      offerDetails,
      type
    );
  }

  @Mutation(() => Notification)
  async sendReadyForPickupNotification(
    @Args('repairSessionId', { type: () => ID }) repairSessionId: number,
    @Args('businessId', { type: () => ID }) businessId: number,
    @Args('recipient') recipient: string,
    @Args('pickupMessage') pickupMessage: string,
    @Args('type', { type: () => NotificationType, defaultValue: NotificationType.EMAIL }) type: NotificationType,
    @CurrentUser() user: User,
  ): Promise<Notification> {
    return this.notificationService.sendReadyForPickupNotification(
      repairSessionId,
      businessId,
      recipient,
      pickupMessage,
      type
    );
  }

  @Query(() => [Notification])
  async notifications(
    @Args('filter') filter: NotificationFilterInput,
    @CurrentUser() user: User,
  ): Promise<Notification[]> {
    return this.notificationService.findNotifications(filter);
  }

  @Query(() => String, { name: 'notificationStats' })
  async getNotificationStats(
    @Args('businessId', { type: () => ID }) businessId: number,
    @CurrentUser() user: User,
  ): Promise<string> {
    const stats = await this.notificationService.getNotificationStats(businessId);
    return JSON.stringify(stats);
  }
}