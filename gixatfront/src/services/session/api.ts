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

export interface SessionEntry {
  id: string;
  type: 'TEXT' | 'NOTE' | 'IMAGE' | 'VOICE' | 'MIXED';
  originalMessage?: string;
  cleanedMessage?: string;
  photoUrl?: string;
  audioUrl?: string;
  createdAt: string;
  user?: User;
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
    year?: string;
    color?: string;
    vin?: string;
  };
}

interface CreateSessionEntryParams {
  sessionId: string;
  type: SessionEntry['type'];
  originalMessage?: string;
  photoUrl?: string;
  audioUrl?: string;
  userId?: string;
}

interface CreateSessionParams {
  customerId: string;
  carId: string;
  garageId: string;
  status: SessionStatus;
}

class SessionService {
  async createSessionEntry(params: CreateSessionEntryParams): Promise<SessionEntry> {
    try {
      const response = await api.post(`/sessions/${params.sessionId}/entries`, params);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create session entry');
    }
  }

  async getSessionEntries(sessionId: string): Promise<SessionEntry[]> {
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