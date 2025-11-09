"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { GET_REPAIR_SESSIONS_WITH_DETAILS_QUERY } from "@/lib/dashboard.queries";

interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  clientId: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface RepairSession {
  id: string;
  sessionNumber: string;
  customerRequest: string;
  problemDescription?: string;
  status: string;
  priority: string;
  carId: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  displayName: string;
  isCompleted: boolean;
  daysInProgress?: number;
  estimatedCost?: number;
  actualCost?: number;
}

const STATUS_COLORS: Record<string, string> = {
  CUSTOMER_REQUEST: "bg-blue-100 text-blue-700",
  INITIAL_INSPECTION: "bg-cyan-100 text-cyan-700",
  TEST_DRIVE_INSPECTION: "bg-indigo-100 text-indigo-700",
  OFFER_PREPARATION: "bg-purple-100 text-purple-700",
  OFFER_SENT: "bg-pink-100 text-pink-700",
  OFFER_APPROVED: "bg-green-100 text-green-700",
  OFFER_REJECTED: "bg-red-100 text-red-700",
  JOB_CARD_CREATED: "bg-yellow-100 text-yellow-700",
  REPAIR_IN_PROGRESS: "bg-orange-100 text-orange-700",
  QUALITY_CHECK: "bg-teal-100 text-teal-700",
  FINAL_INSPECTION: "bg-lime-100 text-lime-700",
  READY_FOR_DELIVERY: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-700 border border-blue-200",
  NORMAL: "bg-gray-50 text-gray-700 border border-gray-200",
  HIGH: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  URGENT: "bg-red-50 text-red-700 border border-red-200",
};

export default function RepairSessionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<RepairSession[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterClient, setFilterClient] = useState("ALL");

  useEffect(() => {
    const token = storage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    const userData = storage.getUser();
    setUser(userData);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchSessionsWithDetails();
  }, [user]);

  const fetchSessionsWithDetails = async () => {
    try {
      setLoading(true);
      const token = storage.getAccessToken();
      if (!token) return;

      const response = await graphqlRequest<{
        repairSessions: RepairSession[];
        cars: Car[];
        clients: Client[];
      }>(GET_REPAIR_SESSIONS_WITH_DETAILS_QUERY, {}, token);

      if (response.data) {
        setSessions(response.data.repairSessions || []);
        setCars(response.data.cars || []);
        setClients(response.data.clients || []);
      }

      if (response.errors) {
        setError(response.errors[0]?.message || "Failed to load sessions");
      }
    } catch (err) {
      console.error("Error fetching repair sessions:", err);
      setError("Failed to load repair sessions");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get client name for a session
  const getClientForSession = (session: RepairSession): Client | undefined => {
    const car = cars.find((c) => c.id === session.carId);
    if (!car) return undefined;
    return clients.find((c) => c.id === car.clientId);
  };

  // Compute filtered sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }
    if (filterPriority !== "ALL") {
      filtered = filtered.filter((s) => s.priority === filterPriority);
    }
    if (filterClient !== "ALL") {
      filtered = filtered.filter((s) => {
        const client = getClientForSession(s);
        return client?.id === filterClient;
      });
    }

    return filtered;
  }, [sessions, filterStatus, filterPriority, filterClient, cars, clients]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleViewDetails = (sessionId: string) => {
    router.push(`/dashboard/repair-sessions/${sessionId}`);
  };

  if (!user) return null;

  return (
    <DashboardLayout
      userName={user?.firstName || "User"}
      userRole={user?.role || "BUSINESS"}
      userType={user?.userType || "BUSINESS"}
      onLogout={handleLogout}
      title="Repair Sessions"
      subtitle="Manage all repair and maintenance sessions"
    >
      <div className="p-6 space-y-6">
        {/* Create Session Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Repair Sessions</h2>
          <button
            onClick={() => router.push("/dashboard/repair-sessions/create")}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            + Create Repair Session
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Client
              </label>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="CUSTOMER_REQUEST">Customer Request</option>
                <option value="INITIAL_INSPECTION">Initial Inspection</option>
                <option value="TEST_DRIVE_INSPECTION">Test Drive Inspection</option>
                <option value="OFFER_PREPARATION">Offer Preparation</option>
                <option value="OFFER_SENT">Offer Sent</option>
                <option value="OFFER_APPROVED">Offer Approved</option>
                <option value="OFFER_REJECTED">Offer Rejected</option>
                <option value="JOB_CARD_CREATED">Job Card Created</option>
                <option value="REPAIR_IN_PROGRESS">Repair In Progress</option>
                <option value="QUALITY_CHECK">Quality Check</option>
                <option value="FINAL_INSPECTION">Final Inspection</option>
                <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Priority
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {sessions.filter((s) => s.isCompleted).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {sessions.filter((s) => !s.isCompleted).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Urgent</p>
            <p className="text-2xl font-bold text-red-600">
              {sessions.filter((s) => s.priority === "URGENT").length}
            </p>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading repair sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-3">No repair sessions found</p>
              <p className="text-sm text-gray-500">
                {filterStatus !== "ALL" || filterPriority !== "ALL" || filterClient !== "ALL"
                  ? "Try adjusting your filters"
                  : "Sessions will appear here when you create them"}
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-3">No sessions match your filters</p>
              <button
                onClick={() => {
                  setFilterStatus("ALL");
                  setFilterPriority("ALL");
                  setFilterClient("ALL");
                }}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Session #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSessions.map((session) => {
                    const car = cars.find((c) => c.id === session.carId);
                    const client = car ? clients.find((c) => c.id === car.clientId) : undefined;
                    return (
                      <tr key={session.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {session.sessionNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="font-medium text-gray-900">
                            {client ? `${client.firstName} ${client.lastName}` : "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">{client?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {car ? `${car.make} ${car.model}` : "Unknown"}
                          <div className="text-xs text-gray-500">{car?.licensePlate}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="max-w-xs truncate">{session.customerRequest}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              STATUS_COLORS[session.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {session.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              PRIORITY_COLORS[session.priority] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {session.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {session.daysInProgress ? Math.floor(session.daysInProgress) : "0"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewDetails(session.id)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 transition"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}