"use client";

import axios from 'axios';
import { env } from '../../config/env';

const API_URL = `${env.apiUrl}/auth`;

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

export const authService = {
  async register(firstName: string, lastName: string, email: string, password: string) {
    const response = await api.post('/register', { firstName, lastName, email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post('/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // If liveToken is present, store it as before
      if (response.data.liveToken) {
        localStorage.setItem('liveToken', response.data.liveToken);
      }
    }
    return response.data;
  },

  logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    api.post('/logout', { refreshToken });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await api.post('/refresh-token', { refreshToken });
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }
      return response.data;
    } catch (_error) {
      console.error("API error:", _error);
      this.logout();
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};
