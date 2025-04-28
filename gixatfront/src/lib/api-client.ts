"use client";

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '../config/env';

/**
 * Creates a configured Axios instance with common settings for API calls
 * @param baseUrl - The base URL for API requests
 * @returns An Axios instance configured with auth headers and base URL
 */
export const createApiClient = (baseUrl: string): AxiosInstance => {
  const api = axios.create({
    baseURL: baseUrl,
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

  return api;
};

// Default API client for the main API
export const apiClient = createApiClient(env.apiUrl);

// Auth-specific API client
export const authApiClient = createApiClient(`${env.apiUrl}/auth`);