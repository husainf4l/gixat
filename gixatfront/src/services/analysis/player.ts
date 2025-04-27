"use client";

import axios from 'axios';
import { env } from '../../config/env';

const API_URL = `${env.apiUrl}/ai-agent`;

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
});

// Add authorization header for protected requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MatchInfo {
  status: string;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
}

export interface Position {
  x: number;
  y: number;
  time: string;
}

export interface PositionLog {
  positions: Position[];
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  team: string;
  nationality: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  embedding: number[];
}

export interface PlayerPerformance {
  id: string;
  playerId: string;
  matchId: string;
  topSpeed: number;
  avgSpeed: number;
  distanceKm: number;
  sprintCount: number;
  accelerations: number;
  passesCompleted: number;
  shotsOnTarget: number;
  interceptions: number;
  tackles: number;
  heartRateAvg: number;
  heartRateMax: number;
  bodyTempC: number;
  fatigueScore: number;
  staminaScore: number;
  heatmapUrl: string;
  positionLog: PositionLog;
  createdAt: string;
  embedding: number[];
}

export interface PlayerIdentificationResponse {
  status?: string;
  message?: string;
  player?: Player;
  playerPerformance?: PlayerPerformance;
  // Legacy fields for backward compatibility
  playerNumber?: number;
  team?: string;
}

export const playerService = {

  async uploadFileForIdentification(
    file: File, 
    matchInfo: MatchInfo
  ): Promise<PlayerIdentificationResponse> {
    // Create form data object
    const formData = new FormData();
    
    // Append the file
    formData.append('file', file);
    
    // Append match information as a JSON string
    // Using matchData as field name (required by backend)
    formData.append('matchData', JSON.stringify(matchInfo));

    try {
      // Add timeout to prevent long-running requests
      const response = await api.post('/roya34-upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30 seconds timeout
      });
      
      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid response format:', response.data);
        return {
          status: 'error',
          message: 'Invalid response from server. Please try again.'
        };
      }
      
      // Handle the new response format with player and playerPerformance
      if (response.data.player && response.data.playerPerformance) {
        return {
          status: 'success',
          player: response.data.player,
          playerPerformance: response.data.playerPerformance,
          message: 'Player identified successfully.'
        };
      }
      
      // If the API doesn't follow the new format but includes legacy fields, normalize it
      if (response.data.playerNumber && response.data.team) {
        return {
          status: 'success',
          playerNumber: response.data.playerNumber,
          team: response.data.team,
          message: response.data.message || 'Player identified successfully.'
        };
      }
      
      // If we have some response data but in an unexpected format
      if (response.data) {
        console.warn('Unexpected response format:', response.data);
        return {
          status: 'success',
          ...response.data,
          message: response.data.message || 'Player data received but in unexpected format.'
        };
      }
      
      return {
        status: 'error',
        message: 'No player data received from server.'
      };
    } catch (error: unknown) {
      console.error('Error uploading file for player identification:', error);
      
      // Type guard to handle error properly
      const err = error as {
        code?: string;
        message?: string;
        response?: {
          status: number;
          data?: {
            message?: string;
          };
        };
      };
      
      // Handle network errors
      if (err.code === 'ECONNABORTED') {
        return {
          status: 'error',
          message: 'Request timed out. Please check your connection and try again.'
        };
      }
      
      // Handle API errors with response
      if (err.response) {
        const statusCode = err.response.status;
        let errorMessage = 'Failed to identify player. Please try again.';
        
        // Customize message based on status code
        if (statusCode === 401 || statusCode === 403) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (statusCode === 413) {
          errorMessage = 'Image file is too large. Please use a smaller image.';
        } else if (statusCode === 415) {
          errorMessage = 'Unsupported file type. Please use JPEG or PNG images.';
        } else if (statusCode >= 500) {
          errorMessage = 'Server error. Our team has been notified.';
        }
        
        // If the API returned an error message, use that instead
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        
        return {
          status: 'error',
          message: errorMessage
        };
      }
      
      // Generic error fallback
      return {
        status: 'error',
        message: err.message || 'Failed to identify player. Please try again.'
      };
    }
  }
};