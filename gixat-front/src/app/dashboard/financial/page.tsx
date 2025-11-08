"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { storage } from "@/lib/storage";
import type { User } from "@/lib/auth.types";

export default function FinancialPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const userData = storage.getUser();
    const token = storage.getAccessToken();
    
    if (!userData || !token) {
      router.push("/auth/login");
      return;
    }
    
    setUser(userData);
    setPageLoading(false);
  }, [router]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  if (pageLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout
      userRole={user.type === "BUSINESS" ? "owner" : "client"}
      userType={user.type}
      userName={user.name || "User"}
      onLogout={handleLogout}
      title="Financial Report"
      subtitle="View your garage financial performance and revenue"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Report</h1>
          <p className="text-gray-600 mt-2">View your garage financial performance and revenue</p>
        </div>

        {/* Filters & Date Range */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="date"
              placeholder="From Date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
            <input
              type="date"
              placeholder="To Date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
              <option>Filter by Type</option>
              <option>Revenue</option>
              <option>Expenses</option>
              <option>All Transactions</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition opacity-50 cursor-not-allowed">
              📥 Export Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
            <p className="text-xs text-gray-500 mt-4">Period data loading...</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total Expenses</p>
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
            <p className="text-xs text-gray-500 mt-4">Period data loading...</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Net Profit</p>
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
            <p className="text-xs text-gray-500 mt-4">Period data loading...</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Job Count</p>
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
            <p className="text-xs text-gray-500 mt-4">Period data loading...</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <p className="text-gray-500 mb-2">📊 Chart Placeholder</p>
                <p className="text-sm text-gray-400">Revenue trend visualization</p>
              </div>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <p className="text-gray-500 mb-2">🥧 Chart Placeholder</p>
                <p className="text-sm text-gray-400">Expense distribution visualization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Transactions</h3>
          <EmptyState
            icon="💳"
            title="No Transactions"
            description="No transaction data available for the selected period. Add work orders to generate revenue records."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
