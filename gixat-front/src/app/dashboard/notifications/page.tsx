"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { User } from "@/lib/auth.types";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";

interface Notification {
  id: string;
  type: string;
  subject: string;
  content: string;
  status: string;
  relatedEntityId?: string;
  createdAt?: string;
}

interface NotificationStats {
  unread?: number;
  read?: number;
  total?: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
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

        // Fetch notifications - simple query without parameters
        const response = await graphqlRequest<{ notifications: Notification[] }>(
          `query {
            notifications {
              id
              type
              subject
              content
              status
              relatedEntityId
              createdAt
            }
          }`,
          {},
          token
        );

        if (response.data?.notifications) {
          let filtered = response.data.notifications;

          if (filters.type) {
            filtered = filtered.filter((notif) => notif.type === filters.type);
          }
          if (filters.status) {
            filtered = filtered.filter((notif) => notif.status === filters.status);
          }

          setNotifications(filtered);
          
          // Calculate stats locally
          setStats({
            unread: filtered.filter(n => n.status === "UNREAD").length,
            read: filtered.filter(n => n.status === "READ").length,
            total: filtered.length,
          });
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        setStats({ unread: 0, read: 0, total: 0 });
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      READ: "bg-gray-100 text-gray-800",
      UNREAD: "bg-blue-100 text-blue-800",
      ARCHIVED: "bg-gray-50 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      APPOINTMENT: "",
      REPAIR_SESSION: "",
      JOB_CARD: "",
      INSPECTION: "🔍",
      OFFER: "",
      PAYMENT: "💳",
      MESSAGE: "💬",
      SYSTEM: "",
    };
    return icons[type] || "";
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <DashboardLayout
      userRole={user.type === "BUSINESS" ? "owner" : "client"}
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Notifications"
      subtitle="Stay updated with important system alerts and reminders"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with important system alerts and reminders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Unread </p>
            <p className="text-3xl font-bold text-blue-600">{loading ? "..." : stats.unread || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Read ✓</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.read || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-gray-600 text-sm font-medium mb-2">Total</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700">
              📬 Mark All as Read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="APPOINTMENT">Appointments</option>
              <option value="REPAIR_SESSION">Repair Sessions</option>
              <option value="JOB_CARD">Job Cards</option>
              <option value="INSPECTION">Inspections</option>
              <option value="OFFER">Offers</option>
              <option value="SYSTEM">System</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="UNREAD">Unread</option>
              <option value="READ">Read</option>
            </select>
            <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium">
              🔍 Filter
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <EmptyState
                icon=""
                title="No Notifications"
                description="You're all caught up! No new notifications at this time."
              />
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition ${
                  notif.status === "UNREAD" ? "border-blue-300 bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0 mt-1">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{notif.type.replace(/_/g, " ")}</h3>
                      {notif.status === "UNREAD" && (
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full ml-auto flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-gray-900 font-medium mb-1">{notif.subject}</p>
                    <p className="text-gray-700 mb-2 text-sm">{notif.content}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{formatDate(notif.createdAt)}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(notif.status)}`}>
                        {notif.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
