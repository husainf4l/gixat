import { useEffect, useState } from "react";
import { graphqlRequest } from "@/lib/graphql-client";
import { GET_EMPLOYEES_QUERY } from "@/lib/dashboard.queries";

interface Employee {
  id: string;
  email: string;
  name: string;
  type: string;
  businessId: string;
  isActive: boolean;
}

interface UseEmployeesResult {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch employees/technicians from GraphQL
 * 
 * Usage:
 * const { employees, loading, error } = useEmployees();
 * 
 * Returns:
 * - employees: Array of employee objects
 * - loading: Boolean indicating if data is being fetched
 * - error: Error message if fetch fails
 */
export function useEmployees(): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await graphqlRequest(
          GET_EMPLOYEES_QUERY
        );

        if (response.errors) {
          const errorMsg = response.errors[0]?.message || "Failed to fetch employees";
          console.error("useEmployees - GraphQL Error:", errorMsg);
          setError(errorMsg);
          setEmployees([]);
          return;
        }

        const fetchedEmployees = (response.data as any)?.users || [];
        setEmployees(fetchedEmployees);
      } catch (err) {
        console.error("useEmployees - Error:", err);
        const errorMessage = err instanceof Error ? err.message : "Error fetching employees";
        setError(errorMessage);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return { employees, loading, error };
}

/**
 * Hook to fetch employees filtered by business ID
 * 
 * Usage:
 * const { employees, loading, error } = useEmployeesByBusiness(businessId);
 * 
 * Returns:
 * - employees: Array of employee objects for the specific business
 * - loading: Boolean indicating if data is being fetched
 * - error: Error message if fetch fails
 */
export function useEmployeesByBusiness(businessId: string): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setEmployees([]);
      setLoading(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await graphqlRequest(
          GET_EMPLOYEES_QUERY
        );

        if (response.errors) {
          const errorMsg = response.errors[0]?.message || "Failed to fetch employees";
          console.error("useEmployeesByBusiness - GraphQL Error:", errorMsg);
          setError(errorMsg);
          setEmployees([]);
          return;
        }

        const allEmployees = (response.data as any)?.users || [];
        // Filter by businessId
        const filteredEmployees = allEmployees.filter(
          (emp: Employee) => emp.businessId === businessId
        );
        setEmployees(filteredEmployees);
      } catch (err) {
        console.error("useEmployeesByBusiness - Error:", err);
        const errorMessage = err instanceof Error ? err.message : "Error fetching employees";
        setError(errorMessage);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [businessId]);

  return { employees, loading, error };
}
