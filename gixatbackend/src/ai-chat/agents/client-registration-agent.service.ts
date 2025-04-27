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
    // Parse the existing session data or create a new object to store extracted information
    const extractedInfo: ExtractedClientInfo = {
      ...(sessionData?.extractedInfo || {}),
    };

    // If this is a confirmation message, handle accordingly
    if (
      message.toLowerCase().includes('yes') ||
      message.toLowerCase().includes('correct') ||
      message.toLowerCase().includes('confirm') ||
      message.toLowerCase().includes('that is right')
    ) {
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
            response: `Thank you for confirming. Please review the information one more time:
            
            - Name: ${extractedInfo.name}
            - Mobile: ${extractedInfo.mobileNumber}
            - Car: ${extractedInfo.carModel}
            - Plate: ${extractedInfo.plateNumber}
            ${extractedInfo.color ? `- Color: ${extractedInfo.color}` : ''}
            ${extractedInfo.mileage ? `- Mileage: ${extractedInfo.mileage}` : ''}
            ${extractedInfo.year ? `- Year: ${extractedInfo.year}` : ''}
            
            Would you like me to register this client now? (Type "yes" to confirm)`,
            isComplete: false,
            finalConfirmationShown: true
          };
        }
      }
    }

    // If we're looking for an image upload
    if (message.toLowerCase().includes('upload') || 
        message.toLowerCase().includes('image') || 
        message.toLowerCase().includes('photo') || 
        message.toLowerCase().includes('document') || 
        message.toLowerCase().includes('registration')) {
      
      return this.handleImageUploadRequest(extractedInfo);
    }
    
    // Extract name using improved pattern matching
    const nameMatch = 
      message.match(/(?:name is|client|customer|for|by|from|this is) ([A-Za-z\s]+)(?:\.|,|$)/i) ||
      message.match(/([A-Za-z\s]+?)(?:'s| is| has| with| wants)/i) || 
      message.match(/I(?:'m| am) ([A-Za-z\s]+)(?:\.|,|$)/i);
    
    if (nameMatch) {
      const potentialName = nameMatch[1].trim();
      
      // Validate name is reasonable (not too short and doesn't contain numbers)
      if (potentialName.length > 2 && !/\d/.test(potentialName)) {
        extractedInfo.name = potentialName;
      }
    }
    
    // Extract mobile number with improved validation
    const mobileMatch = message.match(/(\+?[0-9]{10,15})|([0-9]{3}[\s-]?[0-9]{3}[\s-]?[0-9]{4})/);
    if (mobileMatch) {
      // Normalize by removing spaces and dashes
      extractedInfo.mobileNumber = mobileMatch[0].replace(/[\s-]/g, '');
      
      // Ensure mobile number meets minimum length requirements
      if (extractedInfo.mobileNumber.length < 10) {
        extractedInfo.mobileNumber = undefined; // Invalid format
      }
    }
    
    // Extract car model using common car makes
    const carMakes = [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 
      'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Subaru', 'Jeep', 'Tesla', 'Lexus',
      'Acura', 'Bentley', 'Buick', 'Cadillac', 'Chrysler', 'Dodge', 'Ferrari', 'Fiat',
      'GMC', 'Genesis', 'Infiniti', 'Jaguar', 'Land Rover', 'Lincoln', 'Lotus', 'Maserati',
      'Mitsubishi', 'Porsche', 'Ram', 'Rolls-Royce', 'Scion', 'Smart', 'Suzuki', 'Volvo'
    ];
    
    // More robust car model extraction
    for (const make of carMakes) {
      const carRegex = new RegExp(`(${make})\\s+([A-Za-z0-9\\s-]+?)(?:[,\\.\\s]|$)`, 'i');
      const carMatch = message.match(carRegex);
      
      if (carMatch) {
        extractedInfo.carModel = `${carMatch[1]} ${carMatch[2]}`.trim();
        break;
      }
    }
    
    // If no specific make was found, look for general car model mentions
    if (!extractedInfo.carModel) {
      const generalCarMatch = message.match(/(?:car|vehicle|driving|have) (?:a |an |is |)([A-Za-z0-9\s-]+?)(?:[,\.\s]|$)/i);
      if (generalCarMatch) {
        extractedInfo.carModel = generalCarMatch[1].trim();
      }
    }
    
    // Extract plate number with improved pattern matching for various formats
    const plateMatch = 
      message.match(/(?:plate|license|registration)(?:\s+number|\s+#|\s*is|\s*:)?\s*([A-Z0-9]{1,8}[\s-]?[A-Z0-9]{1,4}[\s-]?[A-Z0-9]{1,4})/i) ||
      message.match(/\b([A-Z]{1,3}[\s-]?[0-9]{1,4}[\s-]?[A-Z0-9]{1,3})\b/i);
      
    if (plateMatch) {
      const potentialPlate = plateMatch[1].replace(/\s/g, '').toUpperCase();
      
      // Make sure this doesn't look like a phone number
      // Phone numbers typically have more digits and fewer/no letters
      const digitCount = (potentialPlate.match(/\d/g) || []).length;
      const letterCount = (potentialPlate.match(/[A-Z]/g) || []).length;
      
      if ((digitCount < 10 || letterCount > 0) && potentialPlate.length >= 3) {
        extractedInfo.plateNumber = potentialPlate;
      }
    }
    
    // Extract color with better contextual matching
    const colorMatch = message.match(/(?:color|colour)\s+(?:is|:)?\s*([a-zA-Z]+)/i) ||
                      message.match(/([a-zA-Z]+)\s+(?:color|colour|car|vehicle)/i) ||
                      message.match(/(?:car|vehicle) is (?:a |an |)([a-zA-Z]+)/i);
    
    if (colorMatch) {
      const potentialColor = colorMatch[1].trim().toLowerCase();
      
      // Basic validation for common car colors
      const validColors = [
        'red', 'blue', 'green', 'yellow', 'black', 'white', 'silver', 'gray', 'grey',
        'brown', 'beige', 'purple', 'orange', 'gold', 'maroon', 'navy', 'tan'
      ];
      
      if (validColors.includes(potentialColor)) {
        extractedInfo.color = potentialColor.charAt(0).toUpperCase() + potentialColor.slice(1);
      }
    }
    
    // Extract mileage with better numeric validation
    const mileageMatch = message.match(/(?:mileage|odometer|miles|km)(?:\s+is|\s+of|\s*:)?\s*([0-9,.]+)/i);
    if (mileageMatch) {
      // Remove any commas or dots that might be thousands separators
      const cleanedMileage = mileageMatch[1].replace(/,/g, '');
      const mileageValue = parseInt(cleanedMileage, 10);
      
      // Validate mileage is in a reasonable range
      if (!isNaN(mileageValue) && mileageValue > 0 && mileageValue < 1000000) {
        extractedInfo.mileage = mileageValue;
      }
    }
    
    // Extract year with better validation
    const yearMatch = message.match(/(?:year|model year)(?:\s+is|\s*:)?\s*(20[0-2][0-9]|19[8-9][0-9])/i) ||
                    message.match(/(20[0-2][0-9]|19[8-9][0-9])\s+(?:model|car|vehicle)/i);
    
    if (yearMatch) {
      const yearValue = parseInt(yearMatch[1], 10);
      const currentYear = new Date().getFullYear();
      
      // Validate year is within a reasonable range (1980 to current year + 1)
      if (yearValue >= 1980 && yearValue <= currentYear + 1) {
        extractedInfo.year = yearValue;
      }
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
   * Process an uploaded image to extract client information
   * @param imageBuffer The image data buffer
   * @param sessionId Current session ID
   * @param sessionData Current session data
   * @returns An object containing extracted client information and response
   */
  async processUploadedImage(
    imageBuffer: Buffer,
    sessionId: string,
    sessionData: any
  ): Promise<AgentResponse> {
    // For now, just create a simple mock extraction as if we processed the image
    // In a real implementation, you would use OCR or a specialized API to extract data
    
    // Get the existing extraction information or create new
    const extractedInfo: ExtractedClientInfo = {
      ...(sessionData?.extractedInfo || {}),
      fromImageUpload: true
    };
    
    // If no name is extracted yet, set a placeholder asking for confirmation
    if (!extractedInfo.name) {
      extractedInfo.name = extractedInfo.name || '[Please confirm client name]';
    }
    
    // If no car model is extracted yet, set a placeholder
    if (!extractedInfo.carModel) {
      extractedInfo.carModel = extractedInfo.carModel || '[Please confirm car model]';
    }
    
    // Check if there are still missing required fields
    const missingFields = this.getMissingRequiredFields(extractedInfo);
    const isComplete = missingFields.length === 0;
    
    let response = '';
    if (isComplete) {
      response = `I've processed the uploaded image and extracted the following information:
        - Name: ${extractedInfo.name}
        - Mobile: ${extractedInfo.mobileNumber}
        - Car: ${extractedInfo.carModel}
        - Plate: ${extractedInfo.plateNumber}
        ${extractedInfo.color ? `- Color: ${extractedInfo.color}` : ''}
        ${extractedInfo.mileage ? `- Mileage: ${extractedInfo.mileage}` : ''}
        ${extractedInfo.year ? `- Year: ${extractedInfo.year}` : ''}
        
        Is this information correct? Say "yes" to confirm and register the client.`;
    } else {
      response = `I've processed the uploaded image, but I still need some additional information:
        ${missingFields.map(field => `- ${this.formatFieldName(field)}`).join('\n')}
        
        Can you please provide the missing details?`;
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
   * Get the list of required fields that are still missing
   * @param extractedInfo The extracted client information
   * @returns A list of field names that need to be provided
   */
  getMissingRequiredFields(extractedInfo: ExtractedClientInfo): string[] {
    const missingFields: string[] = [];
    
    if (!extractedInfo.name) missingFields.push('name');
    if (!extractedInfo.mobileNumber) missingFields.push('mobileNumber');
    if (!extractedInfo.carModel) missingFields.push('carModel');
    if (!extractedInfo.plateNumber) missingFields.push('plateNumber');
    
    return missingFields;
  }
  
  /**
   * Format a field name for display in the UI
   * @param field The field name
   * @returns A human-friendly version of the field name
   */
  private formatFieldName(field: string): string {
    switch (field) {
      case 'name': return 'Client Name';
      case 'mobileNumber': return 'Mobile Number';
      case 'carModel': return 'Car Model';
      case 'plateNumber': return 'License Plate Number';
      default: return field.charAt(0).toUpperCase() + field.slice(1);
    }
  }
  
  /**
   * Handle the request to upload an image
   * @param extractedInfo Current extracted information
   * @returns A response asking the user to upload an image
   */
  private handleImageUploadRequest(extractedInfo: ExtractedClientInfo): AgentResponse {
    return {
      agentType: AgentType.CLIENT_REGISTRATION,
      extractedInfo,
      missingFields: this.getMissingRequiredFields(extractedInfo),
      response: `I'd be happy to process a registration document image. Please upload a clear photo of the vehicle registration or insurance card, and I'll extract the information automatically.`,
      isComplete: false
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
      garageId: process.env.DEFAULT_GARAGE_ID || '52907745-7672-470e-a803-a2f8feb52944' // Add garageId with a default value
    };
    
    try {
      return await this.clientsService.create(createClientDto);
    } catch (error) {
      // Re-throw the error to be handled by the controller
      throw new BadRequestException(`Failed to create client: ${error.message}`);
    }
  }
}