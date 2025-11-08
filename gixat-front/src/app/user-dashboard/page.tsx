"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { User } from "@/lib/auth.types";
import DashboardLayout from "@/components/DashboardLayout";
import { useClientDashboardStats } from "@/lib/hooks/useClientDashboardStats";

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats, loading: statsLoading, error: statsError } = useClientDashboardStats();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = storage.getUser();
    const accessToken = storage.getAccessToken();

    if (!storedUser || !accessToken) {
      router.push("/auth/login");
      return;
    }

    // Ensure this is a CLIENT user
    if (storedUser.type !== "CLIENT") {
      // Redirect to appropriate dashboard based on user type
      if (storedUser.type === "BUSINESS") {
        router.push("/dashboard");
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
      userRole="client"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Client Dashboard"
      subtitle={`Welcome back, ${user.name}`}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Manage your vehicles and appointments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">My Vehicles</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {statsLoading ? '...' : stats?.totalVehicles || 0}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl opacity-20">🚗</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">All active</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Appointments</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {statsLoading ? '...' : stats?.appointments || 0}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl opacity-20">📅</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats?.pendingAppointments || 0} pending</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Service History</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {statsLoading ? '...' : stats?.totalServiceHistory || 0}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl opacity-20">�</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Records kept</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Reminders</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {statsLoading ? '...' : stats?.reminders || 0}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl opacity-20">🔔</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{statsError ? 'Check connection' : 'Updated now'}</p>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">🚗</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            My Cars
          </h3>
          <p className="text-gray-600 text-sm mb-4">View and manage your vehicles</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">📅</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Appointments
          </h3>
          <p className="text-gray-600 text-sm mb-4">Schedule service appointments</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">🔧</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Service History
          </h3>
          <p className="text-gray-600 text-sm mb-4">Track your service records</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">💼</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Work Orders
          </h3>
          <p className="text-gray-600 text-sm mb-4">View your work orders</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">🔔</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Reminders
          </h3>
          <p className="text-gray-600 text-sm mb-4">Get service reminders</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            View All →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">⚙️</div>
            <span className="text-gray-400 text-xl">→</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
            Settings
          </h3>
          <p className="text-gray-600 text-sm mb-4">Manage your account settings</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition">
            Manage →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
