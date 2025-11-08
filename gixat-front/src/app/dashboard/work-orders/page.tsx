"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";
import { GET_BUSINESS_JOB_CARDS_QUERY } from "@/lib/dashboard.queries";

interface JobCard {
  id: string;
  jobNumber: string;
  title: string;
  status: string;
  priority?: string;
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
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const token = storage.getAccessToken();
        if (!token) return;

        const response = await graphqlRequest<{ jobCards: JobCard[] }>(
          GET_BUSINESS_JOB_CARDS_QUERY,
          undefined,
          token
        );

        if (response.data?.jobCards) {
          let filtered = response.data.jobCards;

          // Apply filters
          if (filters.status) {
            filtered = filtered.filter((card) => card.status === filters.status);
          }
          if (filters.priority) {
            filtered = filtered.filter((card) => card.priority === filters.priority);
          }
          if (filters.search) {
            filtered = filtered.filter((card) =>
              card.jobNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
              card.title.toLowerCase().includes(filters.search.toLowerCase())
            );
          }

          setJobCards(filtered);
        }
      } catch (error) {
        console.error("Error fetching job cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobCards();
  }, [filters]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority?: string) => {
    const colors: Record<string, string> = {
      LOW: "text-green-600",
      MEDIUM: "text-yellow-600",
      HIGH: "text-red-600",
    };
    return colors[priority || "MEDIUM"] || "text-gray-600";
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Orders / Job Cards</h1>
            <p className="text-gray-600 mt-2">Manage {jobCards.length} job card(s)</p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            ➕ Create Job Card
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by job ID or title..."
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
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
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
                <TableHeader columns={["Job #", "Title", "Status", "Priority", "Hours", "Progress"]} />
                <tbody className="divide-y divide-gray-200">
                  {jobCards.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{card.jobNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{card.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                          {card.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${getPriorityColor(card.priority)}`}>
                        {card.priority || "MEDIUM"}
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
