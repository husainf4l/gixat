// Session API service
"use client";

import { apiClient } from '../../lib/api-client';
import { env } from '../../config/env';

export enum SessionStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CLOSED = "CLOSED",
  WAITING_FOR_APPROVAL = "WAITING_FOR_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export interface User {
  id?: string;
  name: string;
  avatar?: string;
}

export interface SessionEntryData {
  id: string;
  type: 'NOTE' | 'PHOTO' | 'VOICE_NOTE' | 'QUOTATION_CREATED' | 'QUOTATION_SENT' | 'CUSTOMER_APPROVAL' | 'JOB_STARTED' | 'JOB_COMPLETED' | 'SYSTEM_MESSAGE' | 'MIXED';
  originalMessage?: string;
  cleanedMessage?: string;
  photoUrl?: string;
  audioUrl?: string;
  createdAt: string;
  user?: User;
  createdById?: string;
  sessionId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  garageId: string;
}

// Add these interfaces if they don't already exist
export interface InspectionImage {
  id: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  notes?: string;
  checklist?: any[]; // You might want to type this more specifically
  testDriveNotes?: string;
  createdAt: string;
  updatedAt: string;
  sessionId: string;
  images: InspectionImage[];
}

export interface Session {
  id: string;
  customerId: string;
  carId: string;
  garageId: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt?: string;
  inspection?: Inspection;
  jobcard?: boolean | object;
  quotation?: boolean | object;
  car?: {
    id: string;
    make: string;
    model: string;
    plateNumber?: string;
    year?: number | string;
    color?: string;
    vin?: string;
  };
  customer?: Customer;
  entries?: SessionEntryData[];
}

interface CreateSessionEntryParams {
  sessionId: string;
  type: SessionEntryData['type'];
  originalMessage?: string;
  cleanedMessage?: string;
  photoUrl?: string;
  audioUrl?: string;
  createdById?: string;
}

interface MixedMediaEntryParams {
  sessionId: string;
  text: string;
  photoUrl?: string;
  audioUrl?: string;
  createdById: string;
}

interface FileUploadParams {
  sessionId: string;
  file: File;
  text?: string;
}

interface CreateSessionParams {
  customerId: string;
  carId: string;
  garageId: string;
  status: SessionStatus;
}

interface CreateInspectionDto {
  sessionId: string;
  notes?: string;
  checklist?: any[];
  testDriveNotes?: string;
}

class SessionService {
  async createSessionEntry(params: CreateSessionEntryParams): Promise<SessionEntryData> {
    try {
      const { sessionId, ...entryData } = params;
      const response = await apiClient.post(`/sessions/${sessionId}/entries`, {
        type: entryData.type,
        originalMessage: entryData.originalMessage,
        cleanedMessage: entryData.cleanedMessage,
        photoUrl: entryData.photoUrl,
        audioUrl: entryData.audioUrl,
        createdById: entryData.createdById,
        sessionId: sessionId
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to create session entry');
    }
  }

  async createMixedMediaEntry(params: MixedMediaEntryParams): Promise<SessionEntryData> {
    try {
      const { sessionId, ...entryData } = params;
      const response = await apiClient.post(`/sessions/${sessionId}/entries/mixed-media`, entryData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create mixed media entry');
    }
  }

  async uploadFileEntry(params: FileUploadParams): Promise<SessionEntryData> {
    try {
      const { sessionId, file, text } = params;
      const formData = new FormData();
      formData.append('file', file);
      if (text) {
        formData.append('text', text);
      }
      
      // Use fetch for file uploads as it handles FormData better
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${env.apiUrl}/sessions/${sessionId}/entries/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('File upload failed');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error('Failed to upload file entry');
    }
  }

  async getSessionEntries(sessionId: string): Promise<SessionEntryData[]> {
    try {
      const response = await apiClient.get(`/sessions/${sessionId}/entries`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get session entries');
    }
  }

  async createSession(params: CreateSessionParams): Promise<Session> {
    try {
      const response = await apiClient.post('/sessions', params);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create session');
    }
  }

  async getSessionsByCustomer(clientsId: string): Promise<Session[]> {
    try {
      const response = await apiClient.get(`/clients/${clientsId}/sessions`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get clients sessions');
    }
  }

  async getSessionById(sessionId: string): Promise<Session> {
    try {
      const response = await apiClient.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get session');
    }
  }
  
  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<Session> {
    try {
      const response = await apiClient.put(`/sessions/${sessionId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update session status');
    }
  }

  // Add these new methods to your sessionService object:

  // Get inspection for a session - now correctly using the controller path
  async getInspection(sessionId: string) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${env.apiUrl}/sessions/inspection/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        // If the response is a 404, it means there's no inspection yet for this session
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch inspection: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Ensure the data has the expected structure
      if (!data.images) {
        data.images = [];
      }
      
      // Convert checklist from empty object to array if needed
      if (!Array.isArray(data.checklist)) {
        data.checklist = [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching inspection:', error);
      return null;
    }
  }

  // Create a new inspection
  async createInspection(inspectionData: CreateInspectionDto) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${env.apiUrl}/sessions/inspection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(inspectionData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create inspection: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Ensure the data has the expected structure
      if (!data.images) {
        data.images = [];
      }
      
      // Convert checklist from empty object to array if needed
      if (!Array.isArray(data.checklist)) {
        data.checklist = [];
      }
      
      return data;
    } catch (error) {
      console.error('Error creating inspection:', error);
      throw new Error('Failed to create inspection');
    }
  }

  // Update an existing inspection by ID
  async updateInspection(inspectionId: string, inspectionData: any) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${env.apiUrl}/sessions/inspection/${inspectionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(inspectionData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update inspection: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Ensure the data has the expected structure
      if (!data.images) {
        data.images = [];
      }
      
      // Convert checklist from empty object to array if needed
      if (!Array.isArray(data.checklist)) {
        data.checklist = [];
      }
      
      return data;
    } catch (error) {
      console.error('Error updating inspection:', error);
      throw new Error('Failed to update inspection');
    }
  }

  // Upload an inspection image - updated to use the inspection ID
  async uploadInspectionImage(inspectionId: string, file: File, description?: string): Promise<InspectionImage> {
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('file', file);
      
      if (description) {
        formData.append('description', description);
      }

      const token = localStorage.getItem('access_token');
      
      // Upload the file first
      const uploadResponse = await fetch(`${env.apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image file');
      }
      
      const uploadData = await uploadResponse.json();
      
      // Create the image record using the endpoint from the controller
      const imageData = {
        imageUrl: uploadData.url,
        description,
      };
      
      const response = await fetch(`${env.apiUrl}/sessions/inspection/${inspectionId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(imageData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create inspection image record');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading inspection image:', error);
      throw new Error('Failed to upload inspection image');
    }
  }

  // Delete an inspection image
  async deleteInspectionImage(imageId: string): Promise<{ id: string; deleted: boolean }> {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${env.apiUrl}/sessions/inspection/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete inspection image');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting inspection image:', error);
      throw new Error('Failed to delete inspection image');
    }
  }
}

export const sessionService = new SessionService();