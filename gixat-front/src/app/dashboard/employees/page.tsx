"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";
import { storage } from "@/lib/storage";
import type { User } from "@/lib/auth.types";

interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: string;
  specialization?: string;
  joinDate?: string;
  salary?: number;
  experience?: number;
  certifications?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (pageLoading || !user) {
      return;
    }

    const fetchEmployees = () => {
      try {
        // Load from localStorage
        const savedEmployees = localStorage.getItem("employees");
        const employeeList: Employee[] = savedEmployees ? JSON.parse(savedEmployees) : [];
        setEmployees(employeeList);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [pageLoading, user]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleAddEmployee = () => {
    router.push("/dashboard/employees/create");
  };

  if (pageLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      ON_LEAVE: "bg-yellow-100 text-yellow-800",
      PROBATION: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout
      userRole={user.type === "BUSINESS" ? "owner" : "client"}
      userType={user.type}
      userName={user.name || "User"}
      onLogout={handleLogout}
      title="Employees / Technicians"
      subtitle="Manage your garage staff and technicians"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees / Technicians</h1>
            <p className="text-gray-600 mt-2">
              {employees.length > 0 ? `${employees.length} employee(s)` : "Manage your garage staff and technicians"}
            </p>
          </div>
          <button 
            onClick={handleAddEmployee}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition font-medium border border-gray-200"
          >
            Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
              <option>Filter by Position</option>
              <option>Technician</option>
              <option>Manager</option>
              <option>Helper</option>
              <option>Inspector</option>
              <option>Specialist</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
              <option>Filter by Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>On Leave</option>
              <option>Probation</option>
            </select>
            <button className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition font-medium border border-gray-200">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {employees.length === 0 ? (
            <table className="w-full">
              <TableHeader columns={["Name", "Position", "Email", "Phone", "Status"]} />
              <tbody>
                <tr>
                  <td colSpan={5} className="px-6 py-8">
                    <EmptyState
                      icon="👨‍💼"
                      title="No Employees Yet"
                      description="You haven't added any employees to your garage yet. Click 'Add Employee' to add staff."
                      buttonLabel="Add First Employee"
                      onButtonClick={handleAddEmployee}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <>
              <table className="w-full">
                <TableHeader columns={["Name", "Position", "Email", "Phone", "Status"]} />
                <tbody className="divide-y divide-gray-200">
                  {employees.map((emp) => (
                    <tr 
                      key={emp.id} 
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => router.push(`/dashboard/employees/${emp.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{emp.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{emp.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(emp.status)}`}>
                          {emp.status}
                        </span>
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
