// Example: How to Create Additional Data Hooks for Dashboard Pages

// ============================================================================
// 1. Create a New Hook (e.g., useGarageListing.ts)
// ============================================================================

import { useEffect, useState } from 'react';
import { graphqlRequest } from '../graphql-client';
import { GET_MY_GARAGES_QUERY } from '../dashboard.queries';

export interface Garage {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
}

export const useGarageListing = () => {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        setLoading(true);
        const data: any = await graphqlRequest(GET_MY_GARAGES_QUERY, {});
        setGarages(data?.data?.myGarages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch garages');
      } finally {
        setLoading(false);
      }
    };

    fetchGarages();
  }, []);

  return { garages, loading, error };
};

// ============================================================================
// 2. Use the Hook in a Dashboard Page
// ============================================================================

/*
// /src/app/dashboard/garages/page.tsx

'use client';

import { useGarageListing } from '@/lib/hooks/useGarageListing';
import DashboardLayout from '@/components/DashboardLayout';

export default function GaragesPage() {
  const { garages, loading, error } = useGarageListing();

  return (
    <DashboardLayout
      userRole="owner"
      userType="BUSINESS"
      userName="John Doe"
      title="Garages"
      subtitle="Manage your garage locations"
    >
      {error && (
        <div className="bg-red-100 border border-red-400 p-4 rounded mb-6">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div>Loading garages...</div>
      ) : garages.length === 0 ? (
        <div>No garages found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {garages.map((garage) => (
            <div key={garage.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">{garage.name}</h3>
              <p className="text-gray-600">{garage.address}</p>
              <p className="text-sm text-gray-500">{garage.city}, {garage.state}</p>
              <a href={`tel:${garage.phone}`} className="text-blue-600 mt-2">
                {garage.phone}
              </a>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
*/

// ============================================================================
// 3. Create a Hook for List Data with Pagination
// ============================================================================

import { useCallback, useState } from 'react';

interface UsePaginatedListOptions {
  initialPageSize?: number;
}

export const usePaginatedList = <T,>(
  query: string,
  variables: any,
  options: UsePaginatedListOptions = {}
) => {
  const { initialPageSize = 10 } = options;
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      const data: any = await graphqlRequest(query, {
        ...variables,
        offset: (pageNum - 1) * initialPageSize,
        limit: initialPageSize,
      });
      
      const newItems = data?.data?.items || [];
      setItems((prev) => (pageNum === 1 ? newItems : [...prev, ...newItems]));
      setHasMore(newItems.length === initialPageSize);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [query, variables, initialPageSize]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  return { items, page, loading, error, hasMore, nextPage: () => fetchPage(page + 1) };
};

// ============================================================================
// 4. Create a Hook for Search/Filter
// ============================================================================

export const useGarageSearch = (searchTerm: string) => {
  const { garages, loading: listLoading } = useGarageListing();
  const [loading, setLoading] = useState(false);

  const filteredGarages = garages.filter((garage) =>
    garage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garage.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return { garages: filteredGarages, loading: listLoading };
};

// ============================================================================
// 5. Pattern for Data Mutations (Create/Update/Delete)
// ============================================================================

/*
// Example mutation hook
import { CREATE_GARAGE_MUTATION } from '../dashboard.queries';

export const useCreateGarage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGarage = async (garageData: Omit<Garage, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const result: any = await graphqlRequest(CREATE_GARAGE_MUTATION, {
        input: garageData,
      });
      return result?.data?.createGarage;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create garage';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createGarage, loading, error };
};
*/

// ============================================================================
// 6. Hook Composition Pattern
// ============================================================================

/*
// Combine multiple hooks for complex dashboard

export const useGarageDashboard = () => {
  const stats = useDashboardStats();
  const garages = useGarageListing();
  const appointments = useUpcomingAppointments();

  return {
    stats,
    garages,
    appointments,
    isLoading: stats.loading || garages.loading || appointments.loading,
    hasError: stats.error || garages.error || appointments.error,
  };
};

// Usage in component
const { stats, garages, appointments, isLoading } = useGarageDashboard();
*/

// ============================================================================
// 7. Error Boundary for Hooks
// ============================================================================

/*
'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-100 border border-red-400 p-4 rounded">
            <h3 className="font-bold text-red-800">Something went wrong</h3>
            <p className="text-red-700">{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
*/

// ============================================================================
// 8. Cache Utility for Hooks
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const queryCache = new Map<string, CacheEntry<any>>();

export const getCachedData = <T,>(key: string, ttlMs: number = 5 * 60 * 1000): T | null => {
  const entry = queryCache.get(key);
  
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    queryCache.delete(key);
    return null;
  }
  
  return entry.data;
};

export const setCachedData = <T,>(key: string, data: T, ttlMs: number = 5 * 60 * 1000) => {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
};

export const clearCache = () => {
  queryCache.clear();
};

/*
// Usage in a hook:
export const useCachedGarages = () => {
  const cacheKey = 'garages_list';
  
  // Check cache first
  const cachedData = getCachedData<Garage[]>(cacheKey);
  if (cachedData) {
    return { garages: cachedData, loading: false, error: null };
  }
  
  // Fetch from API
  const { garages, loading, error } = useGarageListing();
  
  // Store in cache
  if (garages.length > 0 && !loading) {
    setCachedData(cacheKey, garages);
  }
  
  return { garages, loading, error };
};
*/

// ============================================================================
// Quick Reference: Hook Template
// ============================================================================

/*
'use client';

import { useEffect, useState } from 'react';
import { graphqlRequest } from '../graphql-client';

interface DataType {
  id: string;
  name: string;
  // Add your fields
}

export const useMyDataHook = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Replace with your query
        const result: any = await graphqlRequest(YOUR_QUERY, {
          // Add variables here
        });
        
        setData(result?.data?.yourField || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
*/
