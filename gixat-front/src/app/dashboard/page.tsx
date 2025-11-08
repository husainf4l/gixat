"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { User } from "@/lib/auth.types";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardStats } from "@/lib/hooks/useDashboardStats";

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = storage.getUser();
    const accessToken = storage.getAccessToken();

    if (!storedUser || !accessToken) {
      router.push("/auth/login");
      return;
    }

    // Ensure this is a BUSINESS user
    if (storedUser.type !== "BUSINESS") {
      // Redirect to appropriate dashboard based on user type
      if (storedUser.type === "CLIENT") {
        router.push("/user-dashboard");
      } else {
        router.push("/auth/login");
      }
      return;
    }

    setUser(storedUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout
      userRole="owner"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Business Dashboard"
      subtitle={`Welcome back, ${user.name}`}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Overview</h1>
        <p className="text-gray-600 text-sm sm:text-base">Monitor your business performance and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Clients</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {statsLoading ? '...' : stats?.clientStats.totalClients || 0}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl opacity-20">👥</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats?.clientStats.activeClients || 0} active</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Vehicles</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {statsLoading ? '...' : stats?.carStats.totalCars || 0}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl opacity-20">�</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats?.clientStats.clientsWithCars || 0} with services</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Appointments</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {statsLoading ? '...' : stats?.appointmentStats.total || 0}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl opacity-20">�</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats?.appointmentStats.pending || 0} pending</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Revenue</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {statsLoading ? '...' : stats?.totalRevenue}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl opacity-20">💰</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{statsError ? 'Check connection' : 'Updated now'}</p>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">📊</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Employees
          </h3>
          <p className="text-gray-600 text-sm mb-4">Manage your employee team and schedules</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">🏪</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Garages
          </h3>
          <p className="text-gray-600 text-sm mb-4">Manage your garages and locations</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">💼</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Services
          </h3>
          <p className="text-gray-600 text-sm mb-4">Manage available services</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">📋</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Work Orders
          </h3>
          <p className="text-gray-600 text-sm mb-4">Track and manage work orders</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">💳</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Financial
          </h3>
          <p className="text-gray-600 text-sm mb-4">View financial reports and analytics</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">⚙️</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Settings
          </h3>
          <p className="text-gray-600 text-sm mb-4">Configure business settings</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            Manage →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
