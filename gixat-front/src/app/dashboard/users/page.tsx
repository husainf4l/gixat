"use client";

import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TableSkeleton, TablePagination } from "@/components/Table";

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-2">Manage all system users and their permissions</p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            ➕ Add User
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
              <option>Filter by Role</option>
              <option>Admin</option>
              <option>Garage Owner</option>
              <option>Client</option>
            </select>
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
            <TableHeader columns={["Name", "Email", "Role", "Status", "Joined"]} withCheckbox={true} />
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td colSpan={6} className="px-6 py-8">
                  <EmptyState
                    icon="👥"
                    title="No Users Yet"
                    description="No users have been created yet. Click 'Add User' to create the first user."
                    buttonLabel="Add First User"
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
