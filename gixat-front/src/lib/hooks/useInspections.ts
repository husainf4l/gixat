'use client';

import { useEffect, useState } from 'react';
import { graphqlRequest } from '../graphql-client';
import { storage } from '../storage';
import { GET_BUSINESS_INSPECTIONS_QUERY, GET_INSPECTION_STATISTICS_QUERY } from '../dashboard.queries';

export interface Inspection {
  id: string;
  type: string;
  title: string;
  findings: string;
  passed: boolean;
  inspectionDate: string;
  repairSessionId?: string;
  inspectorId?: string;
  status?: string;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionStats {
  total: number;
  passed: number;
  failed: number;
  requiresFollowUp: number;
  averageFindingsPerInspection: number;
}

interface UseInspectionsReturn {
  inspections: Inspection[];
  stats: InspectionStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DEFAULT_STATS: InspectionStats = {
  total: 0,
  passed: 0,
  failed: 0,
  requiresFollowUp: 0,
  averageFindingsPerInspection: 0,
};

export const useInspections = (businessId?: string): UseInspectionsReturn => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [stats, setStats] = useState<InspectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from storage
      const token = storage.getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Get user for businessId if not provided
      const user = storage.getUser();
      const currentBusinessId = businessId || user?.id || '1';

      // Fetch inspections
      const inspectionsResponse = await graphqlRequest<{ inspections: Inspection[] }>(
        GET_BUSINESS_INSPECTIONS_QUERY,
        { businessId: currentBusinessId },
        token
      );

      // Fetch inspection statistics
      const statsResponse = await graphqlRequest<{ inspectionStatistics: InspectionStats }>(
        GET_INSPECTION_STATISTICS_QUERY,
        { businessId: currentBusinessId },
        token
      );

      if (inspectionsResponse.data?.inspections) {
        setInspections(inspectionsResponse.data.inspections);
      } else {
        setInspections([]);
      }

      if (statsResponse.data?.inspectionStatistics) {
        setStats(statsResponse.data.inspectionStatistics);
      } else {
        // Calculate stats from inspections data if stats query fails
        const inspectionsData = inspectionsResponse.data?.inspections || [];
        const calculatedStats: InspectionStats = {
          total: inspectionsData.length,
          passed: inspectionsData.filter(i => i.passed).length,
          failed: inspectionsData.filter(i => !i.passed).length,
          requiresFollowUp: inspectionsData.filter(i => i.status === 'FOLLOW_UP').length,
          averageFindingsPerInspection: inspectionsData.length > 0 
            ? inspectionsData.reduce((acc, i) => acc + (i.findings?.length || 0), 0) / inspectionsData.length
            : 0,
        };
        setStats(calculatedStats);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch inspections';
      console.error('Inspections fetch error:', errorMessage);
      setError(errorMessage);
      setInspections([]);
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [businessId]);

  return {
    inspections,
    stats,
    loading,
    error,
    refetch: fetchInspections,
  };
};