"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";
import { User } from "@/lib/auth.types";
import {
  GET_BUSINESS_STATS_QUERY,
  GET_CLIENT_STATS_QUERY,
  GET_CLIENT_CARS_QUERY,
  GET_GARAGE_STATISTICS_QUERY,
} from "@/lib/dashboard.queries";

interface RepairStats {
  value?: string | number;
}

interface JobStats {
  value?: string | number;
}

interface GarageStats {
  value?: string | number;
}

export default function DashboardHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [stats, setStats] = useState<{
    repair?: RepairStats;
    job?: JobStats;
    garage?: GarageStats;
    cars?: number;
  }>({});

  // Check authentication on mount
  useEffect(() => {
    const authUser = storage.getUser();
    const token = storage.getAccessToken();
    
    if (!authUser || !token) {
      router.push("/auth/login");
      return;
    }
    
    setUser(authUser);
    setPageLoading(false);
  }, [router]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = storage.getUser();
        const token = storage.getAccessToken();
        
        if (!user || !token) return;
        
        let role = user.type?.toLowerCase() || "client";
        // Map backend role "business" to frontend role "owner"
        if (role === "business") {
          role = "owner";
        }
        setUserRole(role);

        if (role === "owner") {
          // Fetch business/owner stats
          try {
            const statsResponse = await graphqlRequest<{
              repairSessionStatistics: string;
              jobCardStatistics: string;
            }>(GET_BUSINESS_STATS_QUERY, { businessId: "1" }, token);

            if (statsResponse.data) {
              setStats({
                repair: { value: statsResponse.data.repairSessionStatistics },
                job: { value: statsResponse.data.jobCardStatistics },
              });
            }
          } catch (err) {
            console.warn("Failed to fetch business stats:", err);
          }

          // Fetch garage statistics
          try {
            const garageResponse = await graphqlRequest<{
              repairSessionStatistics: string;
            }>(GET_GARAGE_STATISTICS_QUERY, { businessId: "1" }, token);

            if (garageResponse?.data?.repairSessionStatistics) {
              setStats((prev) => ({
                ...prev,
                garage: { value: garageResponse.data!.repairSessionStatistics },
              }));
            }
          } catch (err) {
            console.warn("Failed to fetch garage stats:", err);
          }
        } else if (role === "client") {
          try {
            // Fetch client stats
            const clientStatsResponse = await graphqlRequest<{
              repairSessionStatistics: RepairStats;
            }>(GET_CLIENT_STATS_QUERY, { businessId: user.businessId || user.id }, token);

            if (clientStatsResponse.data) {
              setStats({
                repair: clientStatsResponse.data.repairSessionStatistics,
              });
            }
          } catch (err) {
            console.warn("Failed to fetch client stats:", err);
          }

          try {
            // Fetch client cars
            const carsResponse = await graphqlRequest<{
              carsByClient: Array<{ id: string }>;
            }>(GET_CLIENT_CARS_QUERY, { businessId: user.businessId || user.id }, token);

            if (carsResponse.data) {
              setStats((prev) => ({ ...prev, cars: carsResponse.data?.carsByClient.length || 0 }));
            }
          } catch (err) {
            console.warn("Failed to fetch client cars:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (pageLoading || !user) {
    return null;
  }

  let role: "admin" | "owner" | "client" = "client";
  if (user.type?.toLowerCase() === "business") {
    role = "owner";
  } else if (user.type?.toLowerCase() === "client") {
    role = "client";
  } else if (user.type?.toLowerCase() === "admin") {
    role = "admin";
  }

  return (
    <DashboardLayout
      userRole={role}
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Dashboard"
      subtitle="Welcome back! Here's your garage overview"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your garage overview</p>
        </div>

        {/* Business/Owner Dashboard */}
        {userRole === "business" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <p className="text-gray-600 text-sm font-medium mb-2">Repair Sessions</p>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? "..." : stats.repair?.value || "N/A"}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <p className="text-gray-600 text-sm font-medium mb-2">Job Cards</p>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? "..." : stats.job?.value || "N/A"}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <p className="text-gray-600 text-sm font-medium mb-2">Garage Status</p>
                <p className="text-4xl font-bold text-green-600">
                  {loading ? "..." : stats.garage?.value || "N/A"}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <p className="text-gray-600 text-sm font-medium mb-2">Status</p>
                <p className="text-4xl font-bold text-blue-600">
                  {loading ? "..." : "Ready"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/dashboard/cars")}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition text-left"
              >
                <h3 className="font-semibold text-gray-900 mb-2">➕ Add New Car</h3>
                <p className="text-sm text-gray-600">Register a car in garage</p>
              </button>
              <button
                onClick={() => router.push("/dashboard/work-orders")}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition text-left"
              >
                <h3 className="font-semibold text-gray-900 mb-2">📋 Create Job Card</h3>
                <p className="text-sm text-gray-600">Start a new work order</p>
              </button>
            </div>
          </div>
        )}

        {/* Client Dashboard */}
        {userRole === "client" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <p className="text-gray-600 text-sm font-medium mb-2">My Cars</p>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? "..." : stats.cars || 0}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <p className="text-gray-600 text-sm font-medium mb-2">Status</p>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? "..." : "Ready"}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <p className="text-gray-600 text-sm font-medium mb-2">Status</p>
                <p className="text-4xl font-bold text-orange-600">
                  {loading ? "..." : "Active"}
                </p>
              </div>
            </div>

            {/* My Cars Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">My Cars</h2>
              {stats.cars === 0 ? (
                <EmptyState
                  icon="🚗"
                  title="No Cars Yet"
                  description="You haven't registered any cars yet. Add your first car to get started."
                  buttonLabel="Add Car"
                  onButtonClick={() => router.push("/dashboard/my-cars")}
                />
              ) : (
                <p className="text-gray-600">You have {stats.cars} car(s) registered.</p>
              )}
            </div>

            {/* Upcoming Services */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Service Status</h2>
              <p className="text-gray-600">
                Check your service appointments and history
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
