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

// Type definitions for the API response
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  licensePlate: string;
  color: string | null;
  mileage: number | null;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  carModel: string;
  plateNumber: string;
  mobileNumber: string;
  lastVisit: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  vehicles: Vehicle[];
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

export const clientService = {
  async getClients() {
    try {
      const response = await api.get<Client[]>('/clients');
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  async getClientById(id: string) {
    try {
      const response = await api.get<Client>(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      throw error;
    }
  },

  async getClientServiceHistory(clientId: string) {
    try {
      const response = await api.get<ServiceRecord[]>(`/clients/${clientId}/services`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching service history for client ${clientId}:`, error);
      return []; // Return empty array for now, can be improved with better error handling
    }
  }
};