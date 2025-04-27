import { Injectable } from '@nestjs/common';
import { ClientsService } from '../clients/clients.service';
import { CreateClientDto } from '../clients/dto/create-client.dto';
import { ClientRegistrationAgentService } from './agents/client-registration-agent.service'
import { CustomerRequestAgentService } from './agents/customer-request-agent.service';
import { JobCardAgentService } from './agents/job-card-agent.service';
import { IssueExplanationAgentService } from './agents/issue-explanation-agent.service';

// Define agent types for the multi-agent system
export enum AgentType {
  MANAGER = 'manager',
  CLIENT_REGISTRATION = 'client_registration',
  CUSTOMER_REQUEST = 'customer_request',
  JOB_CARD = 'job_card',
  ISSUE_EXPLANATION = 'issue_explanation',
}

// Base interface for all agent responses
export interface AgentResponse {
  response: string;
  agentType: AgentType;
  extractedInfo?: any;
  missingFields?: string[];
  isComplete?: boolean;
  handoffToAgent?: AgentType;
  finalConfirmationShown?: boolean;
}

interface ExtractedClientInfo {
  name?: string;
  mobileNumber?: string;
  carModel?: string;
  plateNumber?: string;
  color?: string;
  mileage?: number;
  year?: number;
  // Flag to track if data came from an image upload
  fromImageUpload?: boolean;
}

@Injectable()
export class AiChatService {
  constructor(
    private clientsService: ClientsService,
    private clientRegistrationAgent: ClientRegistrationAgentService,
    private customerRequestAgent: CustomerRequestAgentService,
    private jobCardAgent: JobCardAgentService,
    private issueExplanationAgent: IssueExplanationAgentService,
  ) {}

  /**
   * Main entry point for message processing - determines which agent to use
   * @param message The user's message
   * @param sessionId The current session ID
   * @param sessionData Current session data
   * @returns Response from the appropriate agent
   */
  async processMessage(
    message: string, 
    sessionId: string, 
    sessionData: any
  ): Promise<AgentResponse> {
    // If session already has an active agent, continue with that agent
    if (sessionData && sessionData.activeAgent && sessionData.activeAgent !== AgentType.MANAGER) {
      return this.routeToAgent(sessionData.activeAgent, message, sessionId, sessionData);
    }
    
    // Otherwise, analyze the message and determine which agent should handle it
    const intent = await this.detectIntent(message);
    
    return this.routeToAgent(intent, message, sessionId, sessionData);
  }
  
  /**
   * Analyze user message to determine which agent should handle it
   * @param message User message
   * @returns The agent type that should handle the message
   */
  private async detectIntent(message: string): Promise<AgentType> {
    const lowerMsg = message.toLowerCase();
    
    // Client registration keywords
    if (
      lowerMsg.includes('new client') || 
      lowerMsg.includes('new customer') || 
      lowerMsg.includes('add client') || 
      lowerMsg.includes('register client') ||
      lowerMsg.includes('new car') ||
      lowerMsg.includes('add a car')
    ) {
      return AgentType.CLIENT_REGISTRATION;
    }
    
    // Customer request keywords
    if (
      lowerMsg.includes('request') || 
      lowerMsg.includes('inquiry') || 
      lowerMsg.includes('ask for') ||
      lowerMsg.includes('complaint')
    ) {
      return AgentType.CUSTOMER_REQUEST;
    }
    
    // Job card keywords
    if (
      lowerMsg.includes('job card') || 
      lowerMsg.includes('repair') || 
      lowerMsg.includes('service') ||
      lowerMsg.includes('maintenance') ||
      lowerMsg.includes('fix')
    ) {
      return AgentType.JOB_CARD;
    }
    
    // Issue explanation keywords
    if (
      lowerMsg.includes('explain') || 
      lowerMsg.includes('issue') || 
      lowerMsg.includes('problem') ||
      lowerMsg.includes('what is') ||
      lowerMsg.includes('how does')
    ) {
      return AgentType.ISSUE_EXPLANATION;
    }
    
    // Default to client registration if no clear intent is detected
    return AgentType.CLIENT_REGISTRATION;
  }
  
  /**
   * Route the message to the appropriate agent
   * @param agentType The type of agent to handle the message
   * @param message The user message
   * @param sessionId The current session ID
   * @param sessionData Current session data
   * @returns The agent's response
   */
  private async routeToAgent(
    agentType: AgentType, 
    message: string, 
    sessionId: string, 
    sessionData: any
  ): Promise<AgentResponse> {
    switch (agentType) {
      case AgentType.CLIENT_REGISTRATION:
        return this.clientRegistrationAgent.processMessage(message, sessionId, sessionData);
        
      case AgentType.CUSTOMER_REQUEST:
        return this.customerRequestAgent.processMessage(message, sessionId, sessionData);
        
      case AgentType.JOB_CARD:
        return this.jobCardAgent.processMessage(message, sessionId, sessionData);
        
      case AgentType.ISSUE_EXPLANATION:
        return this.issueExplanationAgent.processMessage(message, sessionId, sessionData);
        
      default:
        // Fallback to client registration if unknown agent type
        return this.clientRegistrationAgent.processMessage(message, sessionId, sessionData);
    }
  }

  /**
   * Process an uploaded image and route to appropriate agent
   * @param imageBuffer The uploaded image buffer
   * @param sessionId The current session ID
   * @param sessionData Current session data
   * @returns Response from the appropriate agent
   */
  async processUploadedImage(
    imageBuffer: Buffer,
    sessionId: string,
    sessionData: any
  ): Promise<AgentResponse> {
    // If session already has an active agent, continue with that agent for image processing
    if (sessionData && sessionData.activeAgent && sessionData.activeAgent !== AgentType.MANAGER) {
      switch (sessionData.activeAgent) {
        case AgentType.CLIENT_REGISTRATION:
          return this.clientRegistrationAgent.processUploadedImage(imageBuffer, sessionId, sessionData);
          
        case AgentType.JOB_CARD:
          return this.jobCardAgent.processUploadedImage(imageBuffer, sessionId, sessionData);
          
        default:
          // Default to client registration if the active agent doesn't support image processing
          return this.clientRegistrationAgent.processUploadedImage(imageBuffer, sessionId, sessionData);
      }
    }
    
    // Default to client registration for image processing if no active agent
    return this.clientRegistrationAgent.processUploadedImage(imageBuffer, sessionId, sessionData);
  }

  /**
   * Create a client from extracted information if all required fields are present
   * @param extractedInfo The extracted client information
   * @returns The created client or null if missing required fields
   */
  async createClientFromExtractedInfo(extractedInfo: ExtractedClientInfo) {
    // This is a legacy method maintained for compatibility
    // Delegate to the client registration agent
    return this.clientRegistrationAgent.createClientFromExtractedInfo(extractedInfo);
  }
  
  /**
   * Check if required fields are missing - legacy method maintained for compatibility
   * @param info Extracted client information
   * @returns Array of missing field names
   */
  public getMissingRequiredFields(info: ExtractedClientInfo): string[] {
    // This is a legacy method maintained for compatibility
    return this.clientRegistrationAgent.getMissingRequiredFields(info);
  }
}