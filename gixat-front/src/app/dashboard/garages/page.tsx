"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";
import { storage } from "@/lib/storage";
import type { User } from "@/lib/auth.types";

export default function GaragesPage() {
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
      title="Garages List"
      subtitle="View and manage all registered garages in the system"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Garages List</h1>
            <p className="text-gray-600 mt-2">View and manage all registered garages in the system</p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            ➕ Register Garage
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by garage name..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
              <option>Filter by Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition opacity-50 cursor-not-allowed">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <TableHeader columns={["Garage Name", "Owner", "Location", "Capacity", "Status"]} />
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td colSpan={6} className="px-6 py-8">
                  <EmptyState
                    icon=""
                    title="No Garages Yet"
                    description="No garages have been registered yet. Click 'Register Garage' to add a new garage to the system."
                    buttonLabel="Register First Garage"
                    onButtonClick={() => {}}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <TablePagination />
        </div>
      </div>
    </DashboardLayout>
  );
}
