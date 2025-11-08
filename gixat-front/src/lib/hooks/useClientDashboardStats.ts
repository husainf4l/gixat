'use client';

import { useEffect, useState } from 'react';
import { graphqlRequest } from '../graphql-client';
import { GET_CLIENT_CARS_QUERY, GET_CLIENT_APPOINTMENTS_QUERY } from '../dashboard.queries';

export interface ClientDashboardStats {
  totalVehicles: number;
  appointments: number;
  pendingAppointments: number;
  totalServiceHistory: number;
  reminders: number;
}

interface UseClientDashboardStatsReturn {
  stats: ClientDashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DEFAULT_STATS: ClientDashboardStats = {
  totalVehicles: 0,
  appointments: 0,
  pendingAppointments: 0,
  totalServiceHistory: 0,
  reminders: 0,
};

export const useClientDashboardStats = (): UseClientDashboardStatsReturn => {
  const [stats, setStats] = useState<ClientDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch client cars
      const carsData: any = await graphqlRequest(GET_CLIENT_CARS_QUERY, {});
      const carsList = carsData?.data?.cars || [];
      console.log('Client Cars Response:', carsList);

      // Fetch client appointments - need businessId, using "1" as fallback
      const appointmentsData: any = await graphqlRequest(GET_CLIENT_APPOINTMENTS_QUERY, {
        businessId: '1',
      });
      const appointmentsList = appointmentsData?.data?.appointments || [];
      console.log('Client Appointments Response:', appointmentsList);

      // Calculate statistics
      const pendingAppts = appointmentsList.filter(
        (apt: any) => apt.status?.toLowerCase() === 'pending' || apt.status?.toLowerCase() === 'scheduled'
      ).length;

      const formattedStats: ClientDashboardStats = {
        totalVehicles: carsList.length || 0,
        appointments: appointmentsList.length || 0,
        pendingAppointments: pendingAppts,
        totalServiceHistory: 0, // TODO: fetch from service history query
        reminders: 0, // TODO: fetch from reminders query
      };

      setStats(formattedStats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch client dashboard statistics';
      console.error('Client dashboard stats error:', errorMessage);
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
