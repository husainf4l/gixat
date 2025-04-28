// Session API service
import axios from 'axios';
import { env } from '../../config/env';

const API_URL = `${env.apiUrl}`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header for protected requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export interface Session {
  id: string;
  customerId: string;
  carId: string;
  garageId: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt?: string;
  inspection?: boolean | object;
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

class SessionService {
  async createSessionEntry(params: CreateSessionEntryParams): Promise<SessionEntryData> {
    try {
      const { sessionId, ...entryData } = params;
      const response = await api.post(`/sessions/${sessionId}/entries`, {
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
      const response = await api.post(`/sessions/${sessionId}/entries/mixed-media`, entryData);
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
      
      // Use axios with formData - need different headers
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/sessions/${sessionId}/entries/upload`, {
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
      const response = await api.get(`/sessions/${sessionId}/entries`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get session entries');
    }
  }

  async createSession(params: CreateSessionParams): Promise<Session> {
    try {
      const response = await api.post('/sessions', params);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create session');
    }
  }

  async getSessionsByCustomer(clientsId: string): Promise<Session[]> {
    try {
      const response = await api.get(`/clients/${clientsId}/sessions`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get clients sessions');
    }
  }

  async getSessionById(sessionId: string): Promise<Session> {
    try {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to get session');
    }
  }
  
  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<Session> {
    try {
      const response = await api.put(`/sessions/${sessionId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update session status');
    }
  }
}

export const sessionService = new SessionService();