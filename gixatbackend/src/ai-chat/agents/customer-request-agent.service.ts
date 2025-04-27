import { Injectable } from '@nestjs/common';
import { AgentResponse, AgentType } from '../ai-chat.service';

interface CustomerRequest {
  customerId?: string;
  customerName?: string;
  mobileNumber?: string;
  requestType?: 'inquiry' | 'complaint' | 'feedback' | 'other';
  subject?: string;
  details?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

@Injectable()
export class CustomerRequestAgentService {
  constructor() {}

  /**
   * Process a customer request message
   * @param message The user message
   * @param sessionId The current session ID
   * @param sessionData Current session data
   * @returns Processed customer request information
   */
  async processMessage(
    message: string,
    sessionId: string,
    sessionData: any
  ): Promise<AgentResponse> {
    // Get existing request info or initialize new
    let requestInfo: CustomerRequest = 
      (sessionData?.extractedInfo as CustomerRequest) || {};
    
    // Extract request details from message
    
    // Extract request type
    if (message.toLowerCase().includes('complaint') || message.toLowerCase().includes('not working')) {
      requestInfo.requestType = 'complaint';
    } else if (message.toLowerCase().includes('feedback') || message.toLowerCase().includes('suggest')) {
      requestInfo.requestType = 'feedback';
    } else if (message.toLowerCase().includes('inquiry') || message.toLowerCase().includes('question')) {
      requestInfo.requestType = 'inquiry';
    } else if (!requestInfo.requestType) {
      requestInfo.requestType = 'other';
    }
    
    // Extract customer name if available
    const nameMatch = message.match(/(?:my name is|this is) ([A-Za-z\s]+)(?:\.|,|$)/i);
    if (nameMatch) {
      requestInfo.customerName = nameMatch[1].trim();
    }
    
    // Extract mobile number if available
    const mobileMatch = message.match(/(\+?[0-9]{10,15})|([0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{4})/);
    if (mobileMatch) {
      requestInfo.mobileNumber = mobileMatch[0].replace(/[\s-]/g, '');
    }
    
    // Extract subject - look for common subject patterns or use first sentence as subject
    const subjectMatch = message.match(/(?:regarding|about|subject:) (.+?)(?:\.|,|$)/i);
    if (subjectMatch) {
      requestInfo.subject = subjectMatch[1].trim();
    } else if (!requestInfo.subject) {
      // Use first sentence or first 50 chars as subject if not found
      const firstSentence = message.split(/[.!?]/, 1)[0];
      requestInfo.subject = firstSentence.length > 50 
        ? firstSentence.substring(0, 47) + '...' 
        : firstSentence;
    }
    
    // Extract priority indicators
    if (
      message.toLowerCase().includes('urgent') || 
      message.toLowerCase().includes('emergency') || 
      message.toLowerCase().includes('immediately')
    ) {
      requestInfo.priority = 'urgent';
    } else if (
      message.toLowerCase().includes('important') || 
      message.toLowerCase().includes('as soon as possible') || 
      message.toLowerCase().includes('high priority')
    ) {
      requestInfo.priority = 'high';
    } else if (!requestInfo.priority) {
      requestInfo.priority = 'medium'; // Default priority
    }
    
    // Store the full message as details if not already set
    if (!requestInfo.details) {
      requestInfo.details = message;
    }
    
    // Check for required fields
    const missingFields = this.getMissingRequiredFields(requestInfo);
    const isComplete = missingFields.length === 0;
    
    // Generate a response
    let response = '';
    if (isComplete) {
      response = `Thank you for your ${requestInfo.requestType}. I've recorded the following details:
        
Type: ${this.formatRequestType(requestInfo.requestType)}
${requestInfo.customerName ? `Name: ${requestInfo.customerName}` : ''}
${requestInfo.mobileNumber ? `Contact: ${requestInfo.mobileNumber}` : ''}
Subject: ${requestInfo.subject}
Priority: ${this.formatPriority(requestInfo.priority)}

Your request has been logged and will be handled according to its priority. Would you like me to assign this to a specific department or add any additional details?`;
    } else {
      response = `I'm processing your ${requestInfo.requestType || 'request'}. To better assist you, could you please provide the following:
        
${missingFields.map(field => `- ${this.formatFieldName(field)}`).join('\n')}

This will help us address your request more efficiently.`;
    }
    
    return {
      agentType: AgentType.CUSTOMER_REQUEST,
      extractedInfo: requestInfo,
      missingFields,
      response,
      isComplete
    };
  }
  
  /**
   * Check if required fields are missing
   * @param info Customer request information
   * @returns Array of missing field names
   */
  public getMissingRequiredFields(info: CustomerRequest): string[] {
    const missingFields: string[] = [];
    
    if (!info.subject) missingFields.push('subject');
    if (!info.details) missingFields.push('details');
    
    // Either customerId or (customerName and mobileNumber) must be provided
    if (!info.customerId && (!info.customerName || !info.mobileNumber)) {
      if (!info.customerName) missingFields.push('customerName');
      if (!info.mobileNumber) missingFields.push('mobileNumber');
    }
    
    return missingFields;
  }
  
  /**
   * Format field names for user-friendly display
   * @param field The field name
   * @returns Formatted field name
   */
  private formatFieldName(field: string): string {
    switch (field) {
      case 'customerName':
        return 'Your name';
      case 'mobileNumber':
        return 'Contact number';
      case 'subject':
        return 'Brief subject or title for your request';
      case 'details':
        return 'Details of your request or issue';
      default:
        return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  }
  
  /**
   * Format request type for display
   * @param type Request type
   * @returns Formatted request type
   */
  private formatRequestType(type: string): string {
    switch (type) {
      case 'inquiry':
        return 'Inquiry';
      case 'complaint':
        return 'Complaint';
      case 'feedback':
        return 'Feedback';
      case 'other':
        return 'Request';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }
  
  /**
   * Format priority for display
   * @param priority Priority level
   * @returns Formatted priority
   */
  private formatPriority(priority: string): string {
    switch (priority) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      case 'urgent':
        return 'Urgent';
      default:
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
  }
}