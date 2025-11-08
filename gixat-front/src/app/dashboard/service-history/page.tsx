"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";
import { GET_CLIENT_REPAIR_SESSIONS_QUERY, GET_CLIENT_CARS_QUERY } from "@/lib/dashboard.queries";

interface RepairSession {
  id: string;
  sessionNumber: string;
  status: string;
  priority?: string;
  customerRequest?: string;
  problemDescription?: string;
  estimatedCost?: number;
  actualCost?: number;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  createdAt?: string;
}

interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
}

export default function ServiceHistoryPage() {
  const [sessions, setSessions] = useState<RepairSession[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    car: "",
    type: "",
    startDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = storage.getAccessToken();
        if (!token) return;

        // Fetch cars
        const carsResponse = await graphqlRequest<{ carsByClient: Car[] }>(
          GET_CLIENT_CARS_QUERY,
          undefined,
          token
        );
        if (carsResponse.data?.carsByClient) {
          setCars(carsResponse.data.carsByClient);
        }

        // Fetch repair sessions
        const response = await graphqlRequest<{ repairSessions: RepairSession[] }>(
          GET_CLIENT_REPAIR_SESSIONS_QUERY,
          undefined,
          token
        );

        if (response.data?.repairSessions) {
          let filtered = response.data.repairSessions;

          if (filters.type) {
            filtered = filtered.filter((s) => s.priority === filters.type);
          }

          setSessions(filtered);
        }
      } catch (error) {
        console.error("Error fetching service history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service History</h1>
          <p className="text-gray-600 mt-2">
            {sessions.length > 0 ? `${sessions.length} service record(s)` : "View all service records and maintenance history of your cars"}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.car}
              onChange={(e) => setFilters({ ...filters, car: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cars</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.licensePlate} - {car.make} {car.model}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="LOW">Regular Service</option>
              <option value="MEDIUM">Repair</option>
              <option value="HIGH">Urgent Repair</option>
            </select>
            <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {sessions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="📜"
                title="No Service History"
                description="You don't have any service records yet. Once you add cars and visit a garage, your service history will appear here."
              />
            </div>
          ) : (
            <>
              <table className="w-full">
                <TableHeader columns={["Date", "Status", "Priority", "Estimated Cost", "Actual Cost", "Completed"]} />
                <tbody className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatDate(session.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {session.priority || "Normal"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${session.estimatedCost?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${session.actualCost?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(session.actualDeliveryDate)}
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
