import { Injectable } from '@nestjs/common';
import { AgentResponse, AgentType } from '../ai-chat.service';

interface JobCardInfo {
  clientId?: string;
  clientName?: string;
  mobileNumber?: string;
  carModel?: string;
  plateNumber?: string;
  mileage?: number;
  serviceType?: 'routine' | 'repair' | 'diagnostic' | 'emergency' | 'other';
  serviceItems?: string[];
  description?: string;
  appointmentDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

@Injectable()
export class JobCardAgentService {
  constructor() {}

  /**
   * Process a message to create or update a job card
   * @param message User message
   * @param sessionId Current session ID
   * @param sessionData Current session data
   * @returns Job card information and response
   */
  async processMessage(
    message: string,
    sessionId: string,
    sessionData: any
  ): Promise<AgentResponse> {
    // Get existing job card info or initialize new
    let jobCardInfo: JobCardInfo = 
      (sessionData?.extractedInfo as JobCardInfo) || {};
    
    // Extract client information if available
    
    // Extract client name
    const nameMatch = 
      message.match(/(?:name is|client|customer|for|by|from|this is) ([A-Za-z\s]+)(?:\.|,|$)/i) ||
      message.match(/([A-Za-z\s]+?)(?:'s| is| has| with| wants)/i);
    if (nameMatch) {
      jobCardInfo.clientName = nameMatch[1].trim();
    }
    
    // Extract mobile number
    const mobileMatch = message.match(/(\+?[0-9]{10,15})|([0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{4})/);
    if (mobileMatch) {
      jobCardInfo.mobileNumber = mobileMatch[0].replace(/[\s-]/g, '');
    }
    
    // Extract car model
    const carMakes = [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 
      'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Subaru', 'Jeep', 'Tesla', 'Lexus'
    ];
    
    const carModelRegex = new RegExp(`(${carMakes.join('|')})\\s+([A-Za-z0-9\\s]+?)(?:[,\\.\\s]|$)`, 'i');
    const carMatch = message.match(carModelRegex);
    if (carMatch) {
      jobCardInfo.carModel = `${carMatch[1]} ${carMatch[2]}`.trim();
    }
    
    // Extract plate number
    const plateMatch = 
      message.match(/(?:plate|license|car|vehicle)\s+(?:number|#|is|:)?\s*([A-Za-z0-9\s-]{2,10})/i) ||
      message.match(/([A-Z0-9]{2,3}[\s-]?[A-Z0-9]{2,5})/i);
    if (plateMatch) {
      jobCardInfo.plateNumber = plateMatch[1].replace(/\s/g, '').toUpperCase();
    }
    
    // Extract mileage
    const mileageMatch = message.match(/(?:mileage|odometer|miles)\s+(?:is|of|:)?\s*([0-9,]+)/i);
    if (mileageMatch) {
      jobCardInfo.mileage = parseInt(mileageMatch[1].replace(/,/g, ''), 10);
    }
    
    // Determine service type
    if (message.toLowerCase().includes('oil change') || 
        message.toLowerCase().includes('tune up') || 
        message.toLowerCase().includes('maintenance') ||
        message.toLowerCase().includes('service')) {
      jobCardInfo.serviceType = 'routine';
    } else if (message.toLowerCase().includes('repair') || 
               message.toLowerCase().includes('fix') ||
               message.toLowerCase().includes('broken')) {
      jobCardInfo.serviceType = 'repair';
    } else if (message.toLowerCase().includes('diagnos') || 
               message.toLowerCase().includes('check') ||
               message.toLowerCase().includes('inspect')) {
      jobCardInfo.serviceType = 'diagnostic';
    } else if (message.toLowerCase().includes('emergency') || 
               message.toLowerCase().includes('urgent') ||
               message.toLowerCase().includes('asap')) {
      jobCardInfo.serviceType = 'emergency';
    } else if (!jobCardInfo.serviceType) {
      jobCardInfo.serviceType = 'other';
    }
    
    // Extract service items - look for common service items
    const serviceItems = new Set<string>(jobCardInfo.serviceItems || []);
    
    if (message.toLowerCase().includes('oil change')) serviceItems.add('Oil Change');
    if (message.toLowerCase().includes('brake') || message.toLowerCase().includes('braking')) serviceItems.add('Brake Service');
    if (message.toLowerCase().includes('tire') || message.toLowerCase().includes('wheel')) serviceItems.add('Tire Service');
    if (message.toLowerCase().includes('battery')) serviceItems.add('Battery Service');
    if (message.toLowerCase().includes('filter')) serviceItems.add('Filter Replacement');
    if (message.toLowerCase().includes('alignment')) serviceItems.add('Wheel Alignment');
    if (message.toLowerCase().includes('transmission')) serviceItems.add('Transmission Service');
    if (message.toLowerCase().includes('engine')) serviceItems.add('Engine Service');
    if (message.toLowerCase().includes('a/c') || message.toLowerCase().includes('air conditioning')) serviceItems.add('A/C Service');
    if (message.toLowerCase().includes('electrical')) serviceItems.add('Electrical System');
    
    jobCardInfo.serviceItems = Array.from(serviceItems);
    
    // Set description if not already set
    if (!jobCardInfo.description) {
      jobCardInfo.description = message;
    }
    
    // Extract appointment date
    const dateMatch = message.match(/(?:on|for|date|scheduled for|appointment on) (\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i) ||
                  message.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
    if (dateMatch) {
      jobCardInfo.appointmentDate = dateMatch[1];
    }
    
    // Extract priority indicators
    if (message.toLowerCase().includes('urgent') || 
        message.toLowerCase().includes('emergency') || 
        message.toLowerCase().includes('immediately')) {
      jobCardInfo.priority = 'urgent';
    } else if (message.toLowerCase().includes('important') || 
               message.toLowerCase().includes('as soon as possible') || 
               message.toLowerCase().includes('high priority')) {
      jobCardInfo.priority = 'high';
    } else if (!jobCardInfo.priority) {
      jobCardInfo.priority = 'medium'; // Default priority
    }
    
    // Check required fields
    const missingFields = this.getMissingRequiredFields(jobCardInfo);
    const isComplete = missingFields.length === 0;
    
    // Generate a response
    let response = '';
    if (isComplete) {
      response = `Great! I've created a job card with the following details:
        
Client: ${jobCardInfo.clientName}
Contact: ${jobCardInfo.mobileNumber}
Vehicle: ${jobCardInfo.carModel}
Plate Number: ${jobCardInfo.plateNumber}
${jobCardInfo.mileage ? `Mileage: ${jobCardInfo.mileage}` : ''}
Service Type: ${this.formatServiceType(jobCardInfo.serviceType)}
Service Items: ${jobCardInfo.serviceItems.join(', ')}
${jobCardInfo.appointmentDate ? `Appointment: ${jobCardInfo.appointmentDate}` : ''}
Priority: ${this.formatPriority(jobCardInfo.priority)}

Description:
${jobCardInfo.description}

Would you like to schedule this service now or update any of these details?`;
    } else {
      response = `I'm creating a job card for your vehicle service. To proceed, I need the following information:
        
${missingFields.map(field => `- ${this.formatFieldName(field)}`).join('\n')}

Please provide these details so I can complete the job card.`;
    }
    
    return {
      agentType: AgentType.JOB_CARD,
      extractedInfo: jobCardInfo,
      missingFields,
      response,
      isComplete
    };
  }
  
  /**
   * Process an uploaded image (such as a previous job card or vehicle damage)
   * @param imageBuffer The uploaded image buffer
   * @param sessionId Current session ID
   * @param sessionData Current session data
   * @returns Job card information from image
   */
  async processUploadedImage(
    imageBuffer: Buffer,
    sessionId: string,
    sessionData: any
  ): Promise<AgentResponse> {
    // Get existing job card info or initialize new
    let jobCardInfo: JobCardInfo = 
      (sessionData?.extractedInfo as JobCardInfo) || {};
      
    // In a real implementation, this would call OCR or computer vision services
    // to extract information from the image like damage details or a previous job card
    
    // For now, respond with a placeholder message
    const response = `I've received your vehicle image and analyzed it. 
    
This would help our technicians better understand the service needed for your vehicle. Please provide additional details about the service you need.`;
    
    // Check required fields
    const missingFields = this.getMissingRequiredFields(jobCardInfo);
    const isComplete = missingFields.length === 0;
    
    return {
      agentType: AgentType.JOB_CARD,
      extractedInfo: jobCardInfo,
      missingFields,
      response,
      isComplete
    };
  }
  
  /**
   * Check if required fields are missing
   * @param info Job card information
   * @returns Array of missing field names
   */
  private getMissingRequiredFields(info: JobCardInfo): string[] {
    const missingFields: string[] = [];
    
    // Either clientId or (clientName and mobileNumber) must be provided
    if (!info.clientId && (!info.clientName || !info.mobileNumber)) {
      if (!info.clientName) missingFields.push('clientName');
      if (!info.mobileNumber) missingFields.push('mobileNumber');
    }
    
    if (!info.carModel) missingFields.push('carModel');
    if (!info.plateNumber) missingFields.push('plateNumber');
    if (!info.serviceType) missingFields.push('serviceType');
    if (!info.description) missingFields.push('description');
    
    return missingFields;
  }
  
  /**
   * Format field names for user-friendly display
   * @param field The field name
   * @returns Formatted field name
   */
  private formatFieldName(field: string): string {
    switch (field) {
      case 'clientName':
        return 'Your name';
      case 'mobileNumber':
        return 'Contact number';
      case 'carModel':
        return 'Car make and model';
      case 'plateNumber':
        return 'License plate number';
      case 'mileage':
        return 'Current mileage';
      case 'serviceType':
        return 'Type of service needed';
      case 'description':
        return 'Description of the issue or service needed';
      case 'appointmentDate':
        return 'Preferred appointment date';
      default:
        return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  }
  
  /**
   * Format service type for display
   * @param type Service type
   * @returns Formatted service type
   */
  private formatServiceType(type: string): string {
    switch (type) {
      case 'routine':
        return 'Routine Maintenance';
      case 'repair':
        return 'Repair Service';
      case 'diagnostic':
        return 'Diagnostic Service';
      case 'emergency':
        return 'Emergency Service';
      case 'other':
        return 'Other Service';
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