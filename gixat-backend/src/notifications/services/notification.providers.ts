import { Injectable, Logger } from '@nestjs/common';
import { NotificationProvider } from './notification.service';

// Mock Email Provider (replace with actual email service like SendGrid, AWS SES, etc.)
@Injectable()
export class EmailProvider implements NotificationProvider {
  private readonly logger = new Logger(EmailProvider.name);

  async sendEmail(to: string, subject: string, content: string, metadata?: any): Promise<boolean> {
    try {
      // TODO: Replace with actual email service integration
      this.logger.log(`Sending email to: ${to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Content: ${content.substring(0, 100)}...`);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // For now, always return success (replace with actual email sending logic)
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendSMS(to: string, content: string, metadata?: any): Promise<boolean> {
    // Email provider doesn't handle SMS
    return false;
  }
}

// Mock SMS Provider (replace with actual SMS service like Twilio, AWS SNS, etc.)
@Injectable()
export class SMSProvider implements NotificationProvider {
  private readonly logger = new Logger(SMSProvider.name);

  async sendSMS(to: string, content: string, metadata?: any): Promise<boolean> {
    try {
      // TODO: Replace with actual SMS service integration
      this.logger.log(`Sending SMS to: ${to}`);
      this.logger.log(`Content: ${content}`);
      
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // For now, always return success (replace with actual SMS sending logic)
      return true;
    } catch (error) {
      this.logger.error('Failed to send SMS:', error);
      return false;
    }
  }

  async sendEmail(to: string, subject: string, content: string, metadata?: any): Promise<boolean> {
    // SMS provider doesn't handle email
    return false;
  }
}

// Template service for generating notification content
@Injectable()
export class NotificationTemplateService {
  generateRepairStatusContent(customerName: string, carModel: string, newStatus: string): string {
    return `Dear ${customerName},

Your ${carModel} repair status has been updated to: ${newStatus}

Thank you for choosing our service.

Best regards,
Gixat Garage Management`;
  }

  generateOfferContent(customerName: string, carModel: string, totalAmount: number): string {
    return `Dear ${customerName},

Your repair quote for ${carModel} is ready.

Total Estimated Cost: $${totalAmount}

Please review and approve the quote to proceed with the repair.

Best regards,
Gixat Garage Management`;
  }

  generateReadyForPickupContent(customerName: string, carModel: string, businessAddress: string): string {
    return `Dear ${customerName},

Great news! Your ${carModel} is ready for pickup.

Pickup Location: ${businessAddress}

Please bring your ID and payment (if applicable) when collecting your vehicle.

Best regards,
Gixat Garage Management`;
  }

  generateInsuranceExpiryContent(customerName: string, carModel: string, expiryDate: string): string {
    return `Dear ${customerName},

This is a friendly reminder that the insurance for your ${carModel} expires on ${expiryDate}.

Please renew your insurance to ensure continuous coverage.

Best regards,
Gixat Garage Management`;
  }

  generateAppointmentReminderContent(customerName: string, appointmentDate: string, serviceType: string): string {
    return `Dear ${customerName},

This is a reminder about your upcoming appointment:

Date: ${appointmentDate}
Service: ${serviceType}

Please arrive 10 minutes before your scheduled time.

Best regards,
Gixat Garage Management`;
  }
}