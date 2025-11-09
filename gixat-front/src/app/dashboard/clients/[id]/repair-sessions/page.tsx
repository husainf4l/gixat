"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";

interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
}

interface RepairSession {
  id: string;
  sessionNumber: string;
  customerRequest: string;
  problemDescription?: string;
  status: string;
  priority: string;
  carId: string;
  createdAt: string;
  updatedAt: string;
  displayName: string;
  isCompleted: boolean;
  daysInProgress?: number;
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

export default function ClientRepairSessionsPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [clientName, setClientName] = useState("");
  const [cars, setCars] = useState<Car[]>([]);
  const [sessions, setSessions] = useState<RepairSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCar, setFilterCar] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const token = storage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    const userData = storage.getUser();
    setUser(userData);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchClientData();
  }, [user]);

  useEffect(() => {
    filterSessions();
  }, [filterCar, filterStatus, sessions]);

  const fetchClientData = async () => {
    try {
      const token = storage.getAccessToken();
      if (!token) return;

      // Fetch client details
      const clientResponse = await graphqlRequest<{ client: any }>(
        `query($id: ID!) {
          client(id: $id) {
            id
            firstName
            lastName
          }
        }`,
        { id: clientId },
        token
      );

      if (clientResponse.data?.client) {
        const client = clientResponse.data.client;
        setClientName(`${client.firstName} ${client.lastName}`);
      }

      // Fetch client's cars
      const carsResponse = await graphqlRequest<{ carsByClient: Car[] }>(
        `query($clientId: ID!) {
          carsByClient(clientId: $clientId) {
            id
            licensePlate
            make
            model
            year
          }
        }`,
        { clientId },
        token
      );

      const clientCars = carsResponse.data?.carsByClient || [];
      setCars(clientCars);

      // Fetch ALL repair sessions (we'll filter by carId on the frontend)
      const sessionsResponse = await graphqlRequest<{ repairSessions: RepairSession[] }>(
        `query {
          repairSessions(limit: 100) {
            id
            sessionNumber
            customerRequest
            problemDescription
            status
            priority
            carId
            createdAt
            updatedAt
            displayName
            isCompleted
            daysInProgress
          }
        }`,
        {},
        token
      );

      let allSessions = sessionsResponse.data?.repairSessions || [];
      console.log("Fetched sessions:", allSessions.length, "Total cars:", clientCars.length);

      // Filter to only sessions for this client's cars
      const clientCarIds = clientCars.map((c) => c.id);
      console.log("Client car IDs:", clientCarIds);
      
      const clientSessions = allSessions.filter((s) => clientCarIds.includes(s.carId));
      console.log("Filtered client sessions:", clientSessions.length);

      setSessions(clientSessions);
    } catch (err) {
      console.error("Error fetching client data:", err);
      setError("Failed to load client repair sessions");
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    if (filterCar !== "ALL") {
      filtered = filtered.filter((s) => s.carId === filterCar);
    }

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((s) => s.status === filterStatus);
    }

    setSessions(filtered);
  };

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleBack = () => {
    router.back();
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
      title={`${clientName}'s Repair Sessions`}
      subtitle={`Viewing repair sessions for client`}
    >
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          ← Back to Client
        </button>

        {/* Client Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{clientName}</h3>
              <p className="text-sm text-gray-600">{cars.length} vehicle(s) registered</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
              <p className="text-sm text-gray-600">repair sessions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Vehicle
              </label>
              <select
                value={filterCar}
                onChange={(e) => setFilterCar(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Vehicles</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.make} {car.model} ({car.licensePlate})
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
                <option value="REPAIR_IN_PROGRESS">Repair In Progress</option>
                <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Repair Sessions Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading repair sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-3">No repair sessions found</p>
              <p className="text-sm text-gray-500">
                Repair sessions will appear here when you create them from the client's vehicle list
              </p>
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
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sessions.map((session) => {
                    const car = cars.find((c) => c.id === session.carId);
                    return (
                      <tr key={session.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {session.sessionNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {car ? `${car.make} ${car.model}` : "Unknown"}
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
