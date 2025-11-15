"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { User } from "@/lib/auth.types";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";

interface Appointment {
  id: string;
  appointmentNumber: string;
  title: string;
  status: string;
  type?: string;
  priority?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedDuration?: number;
  actualStartTime?: string;
  actualEndTime?: string;
  isUpcoming?: boolean;
  isOverdue?: boolean;
  reminderSent?: boolean;
  createdAt?: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
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

  // Fetch appointments - always called, depends on auth state
  useEffect(() => {
    if (pageLoading || !user) {
      return;
    }

    const fetchAppointments = async () => {
      try {
        // Try to fetch from localStorage first (for development/testing)
        const savedAppointments = localStorage.getItem("appointments");
        let allAppointments: Appointment[] = [];

        if (savedAppointments) {
          allAppointments = JSON.parse(savedAppointments);
        } else {
          // Try GraphQL as fallback
          const token = storage.getAccessToken();
          
          if (token) {
            try {
              // Fetch appointments - requires filter with businessId
              const businessId = user.id || "1";
              const response = await graphqlRequest<{ appointments: Appointment[] }>(
                `query($filter: AppointmentFilterInput!) {
                  appointments(filter: $filter) {
                    id
                    appointmentNumber
                    title
                    status
                    scheduledDate
                    scheduledTime
                    createdAt
                  }
                }`,
                { filter: { businessId } },
                token
              );

              if (response.data?.appointments) {
                allAppointments = response.data.appointments;
              }
            } catch (gqlError) {
              console.warn("GraphQL fetch failed, using localStorage only:", gqlError);
            }
          }
        }

        let filtered = allAppointments;

        if (filters.status) {
          filtered = filtered.filter((apt) => apt.status === filters.status);
        }
        if (filters.priority) {
          filtered = filtered.filter((apt) => apt.priority === filters.priority);
        }
        if (filters.search) {
          filtered = filtered.filter((apt) =>
            apt.appointmentNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
            apt.title.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        setAppointments(filtered);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        // Set empty state on error instead of crashing
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filters, pageLoading, user]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleCreateAppointment = () => {
    // Navigate to create appointment page or open modal
    router.push("/dashboard/appointments/create");
  };

  const handleSearch = () => {
    // Trigger search with current filters
    console.log("Searching with filters:", filters);
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
      SCHEDULED: "bg-blue-100 text-blue-800",
      CONFIRMED: "bg-green-100 text-green-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      PENDING: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority?: string) => {
    const colors: Record<string, string> = {
      LOW: "text-green-600",
      MEDIUM: "text-yellow-600",
      HIGH: "text-red-600",
      URGENT: "text-red-700 font-bold",
    };
    return colors[priority || "MEDIUM"] || "text-gray-600";
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (time?: string) => {
    if (!time) return "N/A";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout
      userRole="owner"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Appointments"
      subtitle="Manage customer appointments and scheduling"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-2">
              {appointments.length > 0 ? `${appointments.length} appointment(s)` : "Manage customer appointments and scheduling"}
            </p>
          </div>
          <button 
            onClick={handleCreateAppointment}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition font-medium border border-gray-200"
          >
            New Appointment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Today</p>
            <p className="text-3xl font-bold text-gray-900">
              {appointments.filter(a => {
                const date = new Date(a.scheduledDate || '').toDateString();
                return date === new Date().toDateString();
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Upcoming</p>
            <p className="text-3xl font-bold text-blue-600">
              {appointments.filter(a => a.isUpcoming).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Overdue</p>
            <p className="text-3xl font-bold text-orange-600">
              {appointments.filter(a => a.isOverdue).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Total</p>
            <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by appointment # or title..."
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
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
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
              <option value="URGENT">Urgent</option>
            </select>
            <button 
              onClick={handleSearch}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition font-medium border border-gray-200"
            >
              🔍 Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon=""
                title="No Appointments"
                description="You haven't scheduled any appointments yet. Click 'New Appointment' to create one."
                buttonLabel="Create First Appointment"
                onButtonClick={handleCreateAppointment}
              />
            </div>
          ) : (
            <>
              <table className="w-full">
                <TableHeader columns={["Appointment #", "Title", "Date", "Time", "Duration", "Status", "Priority"]} />
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((apt) => (
                    <tr 
                      key={apt.id} 
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => router.push(`/dashboard/appointments/${apt.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{apt.appointmentNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{apt.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(apt.scheduledDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatTime(apt.scheduledTime)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {apt.estimatedDuration ? `${apt.estimatedDuration} min` : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-medium ${getPriorityColor(apt.priority)}`}>
                        {apt.priority || "MEDIUM"}
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
