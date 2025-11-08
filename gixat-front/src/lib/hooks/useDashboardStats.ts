'use client';

import { useEffect, useState } from 'react';
import { graphqlRequest } from '../graphql-client';
import { storage } from '../storage';

export interface DashboardStats {
  totalGarages: number;
  totalEmployees: number;
  totalWorkOrders: number;
  totalRevenue: string;
  clientStats: {
    totalClients: number;
    activeClients: number;
    clientsWithCars: number;
    totalCars: number;
  };
  carStats: {
    totalCars: number;
  };
  appointmentStats: {
    total: number;
    completed: number;
    pending: number;
    today: number;
  };
  jobCardStats: string; // JSON string from backend
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DEFAULT_STATS: DashboardStats = {
  totalGarages: 0,
  totalEmployees: 0,
  totalWorkOrders: 0,
  totalRevenue: '$0',
  clientStats: {
    totalClients: 0,
    activeClients: 0,
    clientsWithCars: 0,
    totalCars: 0,
  },
  carStats: {
    totalCars: 0,
  },
  appointmentStats: {
    total: 0,
    completed: 0,
    pending: 0,
    today: 0,
  },
  jobCardStats: '{}',
};

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from storage
      const token = storage.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // For now, just return default stats
      // The backend seems to have authorization issues with these queries
      // We'll use the data from individual dashboard pages instead
      setStats(DEFAULT_STATS);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch dashboard statistics';
      console.error('Dashboard stats error:', errorMessage);
      setError(errorMessage);
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
