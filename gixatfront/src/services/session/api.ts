"use client";

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

// Session status enum
export enum SessionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED',
}

// Type definitions for session-related API requests and responses
export interface CreateSessionRequest {
  customerId: string;   // Required - The ID of the customer
  carId: string;        // Required - The ID of the car
  garageId: string;     // Required - The ID of the garage
  status?: SessionStatus; // Optional - Session status (defaults to OPEN if not provided)
  quickBooksId?: string;  // Optional - QuickBooks identifier
}

// Type definitions for customer data in session response
export interface SessionCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  garageId: string;
}

// Type definitions for car data in session response
export interface SessionCar {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  garageId: string;
}

// Type definition for session entry (placeholder for now)
export interface SessionEntry {
  // Define properties based on your actual data structure
  id?: string;
  [key: string]: any;
}

export interface Session {
  id: string;
  customerId: string;
  carId: string;
  garageId: string;
  status: SessionStatus;
  quickBooksId: string | null;
  createdAt: string;
  updatedAt: string;
  // Nested objects from API response
  customer?: SessionCustomer;
  car?: SessionCar;
  entries?: SessionEntry[];
  inspection: any | null;
  preJobcard: any | null;
  quotation: any | null;
  jobcard: any | null;
  aiCarData: any | null;
}

export const sessionService = {
  /**
   * Creates a new session
   * 
   * @param sessionData The session data to create
   * @returns The created session
   */
  async createSession(sessionData: CreateSessionRequest): Promise<Session> {
    try {
      const response = await api.post<Session>('/sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  /**
   * Gets a session by ID
   * 
   * @param id The session ID
   * @returns The session
   */
  async getSessionById(id: string): Promise<Session> {
    try {
      const response = await api.get<Session>(`/sessions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching session with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Gets all sessions for a garage
   * 
   * @param garageId The garage ID
   * @returns Array of sessions
   */
  async getSessionsByGarage(garageId: string): Promise<Session[]> {
    try {
      const response = await api.get<Session[]>(`/sessions?garageId=${garageId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for garage ${garageId}:`, error);
      return [];
    }
  },
  
  /**
   * Gets all sessions for a customer
   * 
   * @param customerId The customer ID
   * @returns Array of sessions
   */
  async getSessionsByCustomer(customerId: string): Promise<Session[]> {
    try {
      const response = await api.get<Session[]>(`/sessions/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sessions for customer ${customerId}:`, error);
      return [];
    }
  },
  
  /**
   * Updates a session's status
   * 
   * @param id The session ID
   * @param status The new status
   * @returns The updated session
   */
  async updateSessionStatus(id: string, status: SessionStatus): Promise<Session> {
    try {
      const response = await api.patch<Session>(`/sessions/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for session ${id}:`, error);
      throw error;
    }
  }
};