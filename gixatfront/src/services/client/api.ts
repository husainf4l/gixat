"use client";

import { apiClient } from '../../lib/api-client';

// Type definitions for the API response
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  plateNumber: string | null;
  color: string | null;
  mileage?: number | null;
  customerId?: string;
  clientId?: string;
  garageId?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  carModel?: string;
  mobileNumber?: string;
  lastVisit?: string | null;
  createdAt: string;
  updatedAt: string;
  garageId?: string;
  plateNumber?: string;
  status?: string;
  cars: Vehicle[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ServiceRecord {
  id: string;
  clientId: string;
  date: string;
  serviceType: string;
  description: string;
  cost: number;
  technicianName: string;
}

export interface NewClientData {
  name: string;
  mobileNumber?: string;
  phone?: string;
  address?: string;
  notes?: string;
  carModel?: string;
  plateNumber?: string;
  color?: string;
  mileage?: number;
  year?: number;
}

class ClientService {
  async getClients(): Promise<Client[]> {
    try {
      const response = await apiClient.get<Client[] | PaginatedResponse<Client>>('/clients');
      
      // Check if the response has a data property (paginated structure)
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Otherwise, return the response data (assuming it's an array)
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  async getClientById(id: string): Promise<Client> {
    try {
      const response = await apiClient.get<Client | { data: Client }>(`/clients/${id}`);
      
      // Check if the response has a data property (nested structure)
      if (response.data && 'data' in response.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      throw error;
    }
  }

  async getClientServiceHistory(clientId: string): Promise<ServiceRecord[]> {
    try {
      const response = await apiClient.get<ServiceRecord[]>(`/clients/${clientId}/services`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching service history for client ${clientId}:`, error);
      return []; // Return empty array for now, can be improved with better error handling
    }
  }
  
  async createClient(clientData: NewClientData): Promise<Client> {
    try {
      const response = await apiClient.post<Client>('/clients', clientData);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }
}

export const clientService = new ClientService();