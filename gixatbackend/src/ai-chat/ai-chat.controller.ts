import { Controller, Post, Body, BadRequestException, Get, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiChatService, AgentType } from './ai-chat.service';

interface ChatMessage {
  message: string;
  sessionId?: string;
}

interface ClientConfirmation {
  sessionId: string;
  confirm: boolean;
}

// Store session information between requests
const sessions = new Map<string, any>();

@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('message')
  async processMessage(@Body() chatMessage: ChatMessage) {
    if (!chatMessage.message) {
      throw new BadRequestException('Message is required');
    }

    const sessionId = chatMessage.sessionId || this.generateSessionId();
    let sessionData = sessions.get(sessionId) || { 
      extractedInfo: {}, 
      conversation: [],
      activeAgent: AgentType.MANAGER
    };
    
    // Add message to conversation history
    sessionData.conversation.push({
      role: 'user',
      content: chatMessage.message,
      timestamp: new Date()
    });

    // Process the message using the AI service with our multi-agent architecture
    const result = await this.aiChatService.processMessage(
      chatMessage.message, 
      sessionId, 
      sessionData
    );
    
    // Update session data with the result from the agent
    sessionData.extractedInfo = {
      ...sessionData.extractedInfo,
      ...(result.extractedInfo || {})
    };
    
    // Update the active agent if different from current
    sessionData.activeAgent = result.handoffToAgent || result.agentType;
    
    // Add AI response to conversation history
    sessionData.conversation.push({
      role: 'assistant',
      content: result.response,
      timestamp: new Date(),
      agentType: result.agentType
    });
    
    // Update session data
    sessionData.missingFields = result.missingFields || [];
    sessionData.isComplete = result.isComplete || false;
    
    // Save the finalConfirmationShown flag in the session if it exists in the result
    if (result.finalConfirmationShown !== undefined) {
      sessionData.finalConfirmationShown = result.finalConfirmationShown;
    }
    
    // Save session data
    sessions.set(sessionId, sessionData);
    
    return {
      sessionId,
      response: result.response,
      extractedInfo: sessionData.extractedInfo,
      missingFields: sessionData.missingFields,
      isComplete: sessionData.isComplete,
      agentType: result.agentType,
      activeAgent: sessionData.activeAgent,
      finalConfirmationShown: sessionData.finalConfirmationShown
    };
  }

  @Post('confirm')
  async confirmClientCreation(@Body() confirmation: ClientConfirmation) {
    const { sessionId, confirm } = confirmation;
    
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }
    
    const sessionData = sessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session not found');
    }
    
    if (!confirm) {
      // If user doesn't confirm, just return a message
      return { 
        message: 'Client creation cancelled. Is there anything else you would like to change?',
        sessionId
      };
    }
    
    // Check if we have all required fields
    if (!sessionData.isComplete) {
      return {
        message: `I still need more information before creating the client. Please provide: ${sessionData.missingFields.join(', ')}`,
        sessionId,
        missingFields: sessionData.missingFields
      };
    }
    
    try {
      // Create the client - use the agent service method which matches the active agent
      let result;
      
      // Currently only client registration has a creation action
      if (sessionData.activeAgent === AgentType.CLIENT_REGISTRATION) {
        result = await this.aiChatService.createClientFromExtractedInfo(sessionData.extractedInfo);
      } else {
        return {
          message: `This operation isn't supported for the current task (${sessionData.activeAgent}). What else would you like to do?`,
          sessionId
        };
      }
      
      // Clear the session data after successful creation
      sessions.delete(sessionId);
      
      return {
        message: 'Client successfully created!',
        clientInfo: result,
        sessionId
      };
    } catch (error) {
      // For unique constraint violations or other validation errors, keep the session active
      // so the user can correct the data and try again
      if (error instanceof BadRequestException) {
        return {
          message: error.message,
          sessionId,
          error: true,
          validationError: true
        };
      }
      
      // For other errors, just report the error
      return {
        message: `Error creating client: ${error.message}`,
        sessionId,
        error: true
      };
    }
  }
  
  @Get('session/:id')
  async getSessionData(@Param('id') sessionId: string) {
    const sessionData = sessions.get(sessionId);
    if (!sessionData) {
      throw new BadRequestException('Session not found');
    }
    
    return {
      sessionId,
      extractedInfo: sessionData.extractedInfo,
      missingFields: sessionData.missingFields,
      isComplete: sessionData.isComplete,
      conversation: sessionData.conversation,
      activeAgent: sessionData.activeAgent
    };
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
  
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadRegistrationImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('sessionId') sessionId?: string
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    
    // Use existing session or create a new one
    const activeSessionId = sessionId || this.generateSessionId();
    let sessionData = sessions.get(activeSessionId) || { 
      extractedInfo: {}, 
      conversation: [],
      activeAgent: AgentType.MANAGER
    };
    
    // Add image upload to conversation history
    sessionData.conversation.push({
      role: 'user',
      content: '[Uploaded image]',
      timestamp: new Date()
    });
    
    // Process the image using the AI service with multi-agent architecture
    const result = await this.aiChatService.processUploadedImage(
      file.buffer, 
      activeSessionId, 
      sessionData
    );
    
    // Merge extracted info with existing session data
    sessionData.extractedInfo = {
      ...sessionData.extractedInfo,
      ...(result.extractedInfo || {})
    };
    
    // Update the active agent if different from current
    sessionData.activeAgent = result.handoffToAgent || result.agentType;
    
    // Add AI response to conversation history
    sessionData.conversation.push({
      role: 'assistant',
      content: result.response,
      timestamp: new Date(),
      agentType: result.agentType
    });
    
    // Update session data
    sessionData.missingFields = result.missingFields || [];
    sessionData.isComplete = result.isComplete || false;
    
    // Save the finalConfirmationShown flag in the session if it exists in the result
    if (result.finalConfirmationShown !== undefined) {
      sessionData.finalConfirmationShown = result.finalConfirmationShown;
    }
    
    // Save session data
    sessions.set(activeSessionId, sessionData);
    
    return {
      sessionId: activeSessionId,
      response: result.response,
      extractedInfo: sessionData.extractedInfo,
      missingFields: sessionData.missingFields,
      isComplete: sessionData.isComplete,
      agentType: result.agentType,
      activeAgent: sessionData.activeAgent,
      finalConfirmationShown: sessionData.finalConfirmationShown
    };
  }
}