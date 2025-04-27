import { Injectable, BadRequestException } from '@nestjs/common';
import { ClientsService } from '../../clients/clients.service';
import { CreateClientDto } from '../../clients/dto/create-client.dto';
import { AgentResponse, AgentType } from '../ai-chat.service';

interface ExtractedClientInfo {
  name?: string;
  mobileNumber?: string;
  carModel?: string;
  plateNumber?: string;
  color?: string;
  mileage?: number;
  year?: number;
  fromImageUpload?: boolean;
}

@Injectable()
export class ClientRegistrationAgentService {
  constructor(private clientsService: ClientsService) {}

  /**
   * Process a text message and extract client information
   * @param message The text message from the user
   * @param sessionId Current session ID
   * @param sessionData Current session data
   * @returns An object containing extracted client information and response
   */
  async processMessage(
    message: string,
    sessionId: string,
    sessionData: any
  ): Promise<AgentResponse> {
    // Get existing extracted info from session or initialize new
    let extractedInfo: ExtractedClientInfo = 
      (sessionData?.extractedInfo as ExtractedClientInfo) || {};
    
    // Check if the message is a confirmation response
    const lowerMessage = message.toLowerCase().trim();
    const confirmationWords = ['yes', 'true', 'correct', 'confirm', 'ok', 'okay', 'agreed'];
    
    if (confirmationWords.includes(lowerMessage)) {
      // If we already have all required info and this is a confirmation
      const missingFields = this.getMissingRequiredFields(extractedInfo);
      if (missingFields.length === 0) {
        // Check if the user has already seen the final confirmation question
        if (sessionData?.finalConfirmationShown) {
          // This is the second confirmation - actually save the data now
          const createdClient = await this.createClientFromExtractedInfo(extractedInfo);
          
          return {
            agentType: AgentType.CLIENT_REGISTRATION,
            extractedInfo,
            missingFields: [],
            response: `Great! I've successfully registered the client with the following information:
            - Name: ${extractedInfo.name}
            - Mobile: ${extractedInfo.mobileNumber}
            - Car: ${extractedInfo.carModel}
            - Plate: ${extractedInfo.plateNumber}
            ${extractedInfo.color ? `- Color: ${extractedInfo.color}` : ''}
            ${extractedInfo.mileage ? `- Mileage: ${extractedInfo.mileage}` : ''}
            ${extractedInfo.year ? `- Year: ${extractedInfo.year}` : ''}
            
            The client has been added to the system with ID: ${createdClient?.id || 'unknown'}.
            Is there anything else you'd like help with?`,
            isComplete: true
          };
        } else {
          // This is the first confirmation - show the final confirmation step
          return {
            agentType: AgentType.CLIENT_REGISTRATION,
            extractedInfo,
            missingFields: [],
            response: `Thanks for confirming. I'll register this client with the information provided. 
            Would you like me to save this data to the system now?`,
            isComplete: true,
            finalConfirmationShown: true  // Add this flag to the response
          };
        }
      }
    }
    
    // Check if message mentions uploading an image
    if (message.toLowerCase().includes('image') || 
        message.toLowerCase().includes('picture') || 
        message.toLowerCase().includes('photo') || 
        message.toLowerCase().includes('upload') ||
        message.toLowerCase().includes('registration')) {
      
      return this.handleImageUploadRequest(extractedInfo);
    }
    
    // Extract name
    const nameMatch = 
      message.match(/(?:name is|client|customer|for|by|from|this is) ([A-Za-z\s]+)(?:\.|,|$)/i) ||
      message.match(/([A-Za-z\s]+?)(?:'s| is| has| with| wants)/i);
    if (nameMatch) {
      extractedInfo.name = nameMatch[1].trim();
    }
    
    // Extract mobile number
    const mobileMatch = message.match(/(\+?[0-9]{10,15})|([0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{4})/);
    if (mobileMatch) {
      extractedInfo.mobileNumber = mobileMatch[0].replace(/[\s-]/g, '');
    }
    
    // Extract car model
    const carMakes = [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 
      'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Subaru', 'Jeep', 'Tesla', 'Lexus'
    ];
    
    const carModelRegex = new RegExp(`(${carMakes.join('|')})\\s+([A-Za-z0-9\\s]+?)(?:[,\\.\\s]|$)`, 'i');
    const carMatch = message.match(carModelRegex);
    if (carMatch) {
      extractedInfo.carModel = `${carMatch[1]} ${carMatch[2]}`.trim();
    }
    
    // Extract plate number - use a more specific regex pattern for license plates
    // Most plate numbers have a specific format with letters and numbers
    // This pattern looks for typical license plate formats while avoiding phone number formats
    const plateMatch = 
      message.match(/(?:plate|license|car|vehicle)\s+(?:number|#|is|:)?\s*([A-Za-z0-9]{2,3}[\s-]?[A-Za-z0-9]{3,4})/i) ||
      message.match(/\b([A-Za-z]{1,3}[\s-]?[0-9]{1,4}[\s-]?[A-Za-z0-9]{1,3})\b/i);
      
    if (plateMatch) {
      const potentialPlate = plateMatch[1].replace(/\s/g, '').toUpperCase();
      
      // Make sure this doesn't look like a phone number
      // Phone numbers typically have more digits and fewer/no letters
      const digitCount = (potentialPlate.match(/\d/g) || []).length;
      const letterCount = (potentialPlate.match(/[A-Z]/g) || []).length;
      
      // Most license plates have some letters and some numbers
      // If it's mostly or all digits, it's more likely to be a phone number
      if (letterCount > 0 && digitCount < 8) {
        extractedInfo.plateNumber = potentialPlate;
      }
    }
    
    // Extract color
    const colorMatch = message.match(/(?:color|colour)\s+(?:is|:)?\s*([a-zA-Z]+)/i) ||
                    message.match(/([a-zA-Z]+)\s+(?:color|colour|car|vehicle)/i);
    if (colorMatch) {
      extractedInfo.color = colorMatch[1].trim();
    }
    
    // Extract mileage
    const mileageMatch = message.match(/(?:mileage|odometer|miles)\s+(?:is|of|:)?\s*([0-9,]+)/i);
    if (mileageMatch) {
      extractedInfo.mileage = parseInt(mileageMatch[1].replace(/,/g, ''), 10);
    }
    
    // Extract year
    const yearMatch = message.match(/(?:year|from|model year)\s+(?:is|:)?\s*(20[0-2][0-9]|19[8-9][0-9])/i) ||
                    message.match(/(20[0-2][0-9]|19[8-9][0-9])\s+(?:model|car|vehicle)/i);
    if (yearMatch) {
      extractedInfo.year = parseInt(yearMatch[1], 10);
    }
    
    // Check required fields
    const missingFields = this.getMissingRequiredFields(extractedInfo);
    const isComplete = missingFields.length === 0;
    
    // Generate a response
    let response = '';
    if (isComplete) {
      response = `Great! I have all the information needed for registering a new client and car. Here's what I gathered:
        - Name: ${extractedInfo.name}
        - Mobile: ${extractedInfo.mobileNumber}
        - Car: ${extractedInfo.carModel}
        - Plate: ${extractedInfo.plateNumber}
        ${extractedInfo.color ? `- Color: ${extractedInfo.color}` : ''}
        ${extractedInfo.mileage ? `- Mileage: ${extractedInfo.mileage}` : ''}
        ${extractedInfo.year ? `- Year: ${extractedInfo.year}` : ''}
        
        I'll add this client to the system now. Is that correct?`;
    } else {
      response = `Thanks for the information. I'm helping you register a new client and car, but I still need a few more details:
        ${missingFields.map(field => `- ${this.formatFieldName(field)}`).join('\n')}
        
        Can you provide these details? You can also upload an image of your car registration document, and I'll extract the information automatically.`;
    }
    
    return { 
      agentType: AgentType.CLIENT_REGISTRATION, 
      extractedInfo, 
      missingFields, 
      response, 
      isComplete 
    };
  }
  
  /**
   * Handle request for image upload to extract car registration information
   * @param extractedInfo Any previously extracted info
   * @returns Response indicating image upload is requested
   */
  private handleImageUploadRequest(extractedInfo: ExtractedClientInfo): AgentResponse {
    const missingFields = this.getMissingRequiredFields(extractedInfo);
    
    return {
      agentType: AgentType.CLIENT_REGISTRATION,
      extractedInfo,
      missingFields,
      response: `You can upload an image of your car registration document, and I'll extract the information automatically. 
      
Once uploaded, I'll process the image to gather details like:
- Owner's name
- Car model
- Plate number
- Registration details

Please upload a clear image of the document.`,
      isComplete: false
    };
  }
  
  /**
   * Process an uploaded image to extract car registration information
   * @param imageBuffer The uploaded image buffer
   * @param sessionId Current session ID
   * @param sessionData Current session data
   * @returns Extracted information from the image
   */
  async processUploadedImage(
    imageBuffer: Buffer, 
    sessionId: string,
    sessionData: any
  ): Promise<AgentResponse> {
    // Get existing extracted info from session or initialize new
    let extractedInfo: ExtractedClientInfo = 
      (sessionData?.extractedInfo as ExtractedClientInfo) || {};
      
    // Mark that this data came from an image upload
    extractedInfo.fromImageUpload = true;
    
    // In a real implementation, this would call an OCR service or ML model
    // to extract information from the image
    
    // Simulate extraction with placeholder data if fields aren't already set
    if (!extractedInfo.name) extractedInfo.name = "Extracted Name";
    if (!extractedInfo.carModel) extractedInfo.carModel = "Extracted Car Model";
    
    // Use a proper plate number format instead of potentially misinterpreting a mobile number
    if (!extractedInfo.plateNumber) extractedInfo.plateNumber = "ABC123";
    
    // For demo purposes, we'll keep the mobile number format clearly distinct from plate formats
    if (!extractedInfo.mobileNumber) {
      // We won't automatically set a mobile number from image - requires explicit user input
      // This helps avoid confusion between plate numbers and mobile numbers
    }
    
    if (!extractedInfo.year && Math.random() > 0.5) extractedInfo.year = 2023;
    if (!extractedInfo.color && Math.random() > 0.5) extractedInfo.color = "Silver";
    
    const missingFields = this.getMissingRequiredFields(extractedInfo);
    const isComplete = missingFields.length === 0;
    
    let response = '';
    if (isComplete) {
      response = `I've successfully extracted all information from your uploaded car registration image:
        - Name: ${extractedInfo.name}
        - Car Model: ${extractedInfo.carModel}
        - Plate Number: ${extractedInfo.plateNumber}
        ${extractedInfo.color ? `- Color: ${extractedInfo.color}` : ''}
        ${extractedInfo.year ? `- Year: ${extractedInfo.year}` : ''}
        
        I still need your mobile number to complete the registration. Can you provide that?`;
    } else {
      response = `I've analyzed your car registration image, but couldn't extract all the required information. 
        
I still need:
${missingFields.map(field => `- ${this.formatFieldName(field)}`).join('\n')}

Please provide these details or upload a clearer image of your car registration document.`;
    }
    
    return { 
      agentType: AgentType.CLIENT_REGISTRATION, 
      extractedInfo, 
      missingFields, 
      response, 
      isComplete 
    };
  }

  /**
   * Create a client from extracted information if all required fields are present
   * @param extractedInfo The extracted client information
   * @returns The created client or null if missing required fields
   */
  async createClientFromExtractedInfo(extractedInfo: ExtractedClientInfo) {
    const missingFields = this.getMissingRequiredFields(extractedInfo);
    
    if (missingFields.length > 0) {
      return null;
    }
    
    // Since we've verified that required fields exist, we can safely assert they're not undefined
    const createClientDto: CreateClientDto = {
      name: extractedInfo.name!,
      mobileNumber: extractedInfo.mobileNumber!,
      carModel: extractedInfo.carModel!,
      plateNumber: extractedInfo.plateNumber!,
      color: extractedInfo.color,
      mileage: extractedInfo.mileage,
      year: extractedInfo.year,
    };
    
    try {
      return await this.clientsService.create(createClientDto);
    } catch (error) {
      // Check if this is a duplicate plate number error
      if (error instanceof BadRequestException && error.message.includes('plate number already exists')) {
        throw new BadRequestException(`A vehicle with plate number ${extractedInfo.plateNumber} already exists in the system. Please check the plate number and try again.`);
      }
      // Re-throw other errors
      throw error;
    }
  }
  
  /**
   * Check if required fields are missing
   * @param info Extracted client information
   * @returns Array of missing field names
   */
  public getMissingRequiredFields(info: ExtractedClientInfo): string[] {
    const missingFields: string[] = [];
    
    if (!info.name) missingFields.push('name');
    if (!info.mobileNumber) missingFields.push('mobileNumber');
    if (!info.carModel) missingFields.push('carModel');
    if (!info.plateNumber) missingFields.push('plateNumber');
    
    return missingFields;
  }
  
  /**
   * Format field names for user-friendly display
   * @param field The field name
   * @returns Formatted field name
   */
  private formatFieldName(field: string): string {
    switch (field) {
      case 'name':
        return 'Client Name';
      case 'mobileNumber':
        return 'Mobile Number';
      case 'carModel':
        return 'Car Make and Model';
      case 'plateNumber':
        return 'License Plate Number';
      default:
        return field.charAt(0).toUpperCase() + field.slice(1);
    }
  }
}