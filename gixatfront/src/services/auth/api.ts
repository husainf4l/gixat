"use client";

import { authApiClient } from '../../lib/api-client';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: any;
  liveToken?: string;
}

class AuthService {
  async register(firstName: string, lastName: string, email: string, password: string, garageId: string): Promise<AuthResponse> {
    const response = await authApiClient.post('/register', { firstName, lastName, email, password, garageId });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await authApiClient.post('/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Save garage ID if it exists in the user object
      if (response.data.user && response.data.user.garageId) {
        localStorage.setItem('garageId', response.data.user.garageId);
      }
      
      // If liveToken is present, store it as before
      if (response.data.liveToken) {
        localStorage.setItem('liveToken', response.data.liveToken);
      }
    }
    return response.data;
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    authApiClient.post('/logout', { refreshToken });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('garageId');
    localStorage.removeItem('liveToken'); // Also remove liveToken if it exists
  }

  async refreshToken(): Promise<AuthResponse | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await authApiClient.post('/refresh-token', { refreshToken });
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }
      return response.data;
    } catch (_error) {
      console.error("API error:", _error);
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
}

export const authService = new AuthService();
