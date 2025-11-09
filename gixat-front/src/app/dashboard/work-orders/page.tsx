"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { User } from "@/lib/auth.types";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";

interface JobCard {
  id: string;
  title: string;
  status: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  progress?: number;
  isOverdue?: boolean;
  daysRemaining?: number;
  createdAt?: string;
}

export default function WorkOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
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

  // Fetch job cards - always called, depends on auth state
  useEffect(() => {
    if (pageLoading || !user) {
      return;
    }

    const fetchJobCards = async () => {
      try {
        const token = storage.getAccessToken();
        
        if (!token) {
          console.warn("Missing token");
          return;
        }

        // Fetch job cards with businessId parameter (using user id or default "1")
        const businessId = user.id || "1";
        const response = await graphqlRequest<{ jobCards: JobCard[] }>(
          `query($businessId: ID!) {
            jobCards(businessId: $businessId) {
              id
              title
              status
              plannedStartDate
              plannedEndDate
              actualStartDate
              actualEndDate
              estimatedHours
              actualHours
              progress
              isOverdue
              daysRemaining
              createdAt
            }
          }`,
          { businessId },
          token
        );

        if (response.data?.jobCards) {
          let filtered = response.data.jobCards;

          // Apply filters
          if (filters.status) {
            filtered = filtered.filter((card) => card.status === filters.status);
          }
          if (filters.search) {
            filtered = filtered.filter((card) =>
              card.title.toLowerCase().includes(filters.search.toLowerCase())
            );
          }

          setJobCards(filtered);
        }
      } catch (error) {
        console.error("Error fetching job cards:", error);
        // Set empty state on error instead of crashing
        setJobCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobCards();
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout
      userRole="owner"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Work Orders"
      subtitle="Manage job cards and work assignments"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Orders / Job Cards</h1>
            <p className="text-gray-600 mt-2">{jobCards.length > 0 ? `${jobCards.length} job card(s)` : "Manage job cards and work assignments"}</p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            ➕ Create Job Card
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by job title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {jobCards.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="📋"
                title="No Work Orders"
                description="You haven't created any work orders yet. Click 'Create Job Card' to start a new repair job."
                buttonLabel="Create First Job Card"
                onButtonClick={() => {}}
              />
            </div>
          ) : (
            <>
              <table className="w-full">
                <TableHeader columns={["Title", "Status", "Hours", "Progress", "Overdue"]} />
                <tbody className="divide-y divide-gray-200">
                  {jobCards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{card.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                          {card.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {card.actualHours || 0}/{card.estimatedHours || 0}h
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${card.progress || 0}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {card.isOverdue ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Overdue
                          </span>
                        ) : (
                          <span className="text-gray-600">{card.daysRemaining || 0} days left</span>
                        )}
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
