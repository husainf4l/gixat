"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { User } from "@/lib/auth.types";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";

interface Inspection {
  id: string;
  type: string;
  title: string;
  createdAt?: string;
}

interface InspectionStats {
  total?: number;
  passed?: number;
  failed?: number;
  requiresFollowUp?: number;
  averageFindingsPerInspection?: number;
}

export default function InspectionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [stats, setStats] = useState<InspectionStats>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: "",
  });

  // Authentication check - runs on mount
  useEffect(() => {
    const storedUser = storage.getUser();
    const accessToken = storage.getAccessToken();

    if (!storedUser || !accessToken) {
      router.push("/auth/login");
      return;
    }

    setUser(storedUser);
    setPageLoading(false);
  }, [router]);

  // Fetch data - always called, depends on auth state
  useEffect(() => {
    if (pageLoading || !user) {
      return;
    }

    const fetchData = async () => {
      try {
        const token = storage.getAccessToken();
        
        if (!token) return;

        // Fetch inspections - requires filter with businessId
        const businessId = user.id || "1";
        const response = await graphqlRequest<{ inspections: Inspection[] }>(
          `query($filter: InspectionFilterInput!) {
            inspections(filter: $filter) {
              id
              type
              title
              createdAt
            }
          }`,
          { filter: { businessId } },
          token
        );

        if (response.data?.inspections) {
          let filtered = response.data.inspections;

          if (filters.type) {
            filtered = filtered.filter((insp) => insp.type === filters.type);
          }
          if (filters.search) {
            filtered = filtered.filter((insp) =>
              insp.title.toLowerCase().includes(filters.search.toLowerCase())
            );
          }

          setInspections(filtered);
        }

        // Set default stats - calculated from inspections
        setStats({
          total: response.data?.inspections?.length || 0,
          passed: 0,
          failed: 0,
          requiresFollowUp: 0,
          averageFindingsPerInspection: 0,
        });
      } catch (error) {
        console.error("Error fetching inspections:", error);
        // Set empty state on error instead of crashing
        setInspections([]);
        setStats({
          total: 0,
          passed: 0,
          failed: 0,
          requiresFollowUp: 0,
          averageFindingsPerInspection: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, pageLoading, user]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (passed: boolean) => {
    if (passed) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusText = (passed: boolean) => {
    if (passed) return "Passed";
    return "Failed";
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };  return (
    <DashboardLayout
      userRole="owner"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Inspections"
      subtitle="Manage vehicle inspections and findings"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inspections</h1>
            <p className="text-gray-600 mt-2">
              {inspections.length > 0 ? `${inspections.length} inspection(s)` : "Track vehicle inspections and diagnostics"}
            </p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            ➕ New Inspection
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Total</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Passed ✓</p>
            <p className="text-3xl font-bold text-green-600">{loading ? "..." : stats.passed || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Failed ✗</p>
            <p className="text-3xl font-bold text-red-600">{loading ? "..." : stats.failed || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Follow-up</p>
            <p className="text-3xl font-bold text-yellow-600">{loading ? "..." : stats.requiresFollowUp || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Avg Findings</p>
            <p className="text-3xl font-bold text-blue-600">
              {loading ? "..." : (stats.averageFindingsPerInspection || 0).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="GENERAL">General</option>
              <option value="DETAILED">Detailed</option>
              <option value="PRE_DELIVERY">Pre-Delivery</option>
              <option value="SAFETY">Safety</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PASSED">Passed</option>
              <option value="FAILED">Failed</option>
              <option value="FOLLOW_UP">Follow-up Required</option>
            </select>
            <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {inspections.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="🔍"
                title="No Inspections"
                description="You haven't created any inspections yet. Click 'New Inspection' to start recording vehicle diagnostics."
                buttonLabel="Create First Inspection"
                onButtonClick={() => {}}
              />
            </div>
          ) : (
            <>
              <table className="w-full">
                <TableHeader columns={["Type", "Title", "Created"]} />
                <tbody className="divide-y divide-gray-200">
                  {inspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{insp.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{insp.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {insp.createdAt ? new Date(insp.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
