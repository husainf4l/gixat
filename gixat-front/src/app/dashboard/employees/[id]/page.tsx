"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { storage } from "@/lib/storage";
import DashboardLayout from "@/components/DashboardLayout";

interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  specialization?: string;
  status: string;
  joinDate?: string;
  salary?: number;
  experience?: number;
  certifications?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

interface EditForm {
  name: string;
  email: string;
  phone: string;
  position: string;
  specialization: string;
  status: string;
  joinDate: string;
  salary: string;
  experience: string;
  certifications: string;
  address: string;
  notes: string;
}

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const user = storage.getUser();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState<EditForm>({
    name: "",
    email: "",
    phone: "",
    position: "TECHNICIAN",
    specialization: "GENERAL",
    status: "ACTIVE",
    joinDate: "",
    salary: "",
    experience: "",
    certifications: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    const fetchEmployee = () => {
      try {
        const savedEmployees = localStorage.getItem("employees");
        if (savedEmployees) {
          const employees = JSON.parse(savedEmployees);
          const found = employees.find((emp: Employee) => emp.id === employeeId);
          
          if (found) {
            setEmployee(found);
            setFormData({
              name: found.name,
              email: found.email,
              phone: found.phone,
              position: found.position,
              specialization: found.specialization || "GENERAL",
              status: found.status,
              joinDate: found.joinDate || "",
              salary: String(found.salary || ""),
              experience: String(found.experience || ""),
              certifications: found.certifications || "",
              address: found.address || "",
              notes: found.notes || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const savedEmployees = localStorage.getItem("employees");
      if (savedEmployees) {
        const employees = JSON.parse(savedEmployees);
        const index = employees.findIndex((emp: Employee) => emp.id === employeeId);
        
        if (index !== -1) {
          employees[index] = {
            ...employees[index],
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            position: formData.position,
            specialization: formData.specialization,
            status: formData.status,
            joinDate: formData.joinDate,
            salary: formData.salary ? parseFloat(formData.salary) : 0,
            experience: formData.experience ? parseInt(formData.experience) : 0,
            certifications: formData.certifications,
            address: formData.address,
            notes: formData.notes,
          };
          
          localStorage.setItem("employees", JSON.stringify(employees));
          setEmployee(employees[index]);
          setIsEditing(false);
          alert("Employee updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Failed to save employee");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const savedEmployees = localStorage.getItem("employees");
        if (savedEmployees) {
          const employees = JSON.parse(savedEmployees);
          const filtered = employees.filter((emp: Employee) => emp.id !== employeeId);
          localStorage.setItem("employees", JSON.stringify(filtered));
          alert("Employee deleted successfully!");
          router.push("/dashboard/employees");
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-700">Employee not found</div>
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole="owner"
      userType={user?.type || "BUSINESS"}
      userName={user?.name || "User"}
      onLogout={() => {
        storage.clearAuth();
        router.push("/auth/login");
      }}
      title="Employee Details"
      subtitle={`${employee.employeeNumber} - ${employee.name}`}
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-gray-600 mt-2">{employee.employeeNumber} • {employee.position}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition font-medium border border-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 transition font-medium border border-red-200"
                >
                  Delete
                </button>
              </>
            )}
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition font-medium"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Details/Edit Form */}
        {isEditing ? (
          <form className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-6">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Row 2: Phone and Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="TECHNICIAN">Technician</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HELPER">Helper</option>
                  <option value="INSPECTOR">Inspector</option>
                  <option value="SPECIALIST">Specialist</option>
                </select>
              </div>
            </div>

            {/* Row 3: Specialization and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="GENERAL">General Repair</option>
                  <option value="ENGINE">Engine Specialist</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="TRANSMISSION">Transmission</option>
                  <option value="SUSPENSION">Suspension</option>
                  <option value="BODYWORK">Bodywork</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="PROBATION">On Probation</option>
                </select>
              </div>
            </div>

            {/* Row 4: Join Date and Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Row 5: Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Salary
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Row 6: Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Row 7: Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications / Qualifications
              </label>
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Row 8: Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saveLoading}
                className="flex-1 px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
              >
                {saveLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <p className="text-lg text-gray-900 mt-1">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Phone</p>
                  <p className="text-lg text-gray-900 mt-1">{employee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Position</p>
                  <p className="text-lg text-gray-900 mt-1">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Specialization</p>
                  <p className="text-lg text-gray-900 mt-1">{employee.specialization || "N/A"}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Status</p>
                  <p className="text-lg text-gray-900 mt-1">{employee.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Join Date</p>
                  <p className="text-lg text-gray-900 mt-1">{employee.joinDate || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Years of Experience</p>
                  <p className="text-lg text-gray-900 mt-1">{employee.experience || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Monthly Salary</p>
                  <p className="text-lg text-gray-900 mt-1">${employee.salary || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            {employee.address && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Address</p>
                <p className="text-gray-900 mt-2">{employee.address}</p>
              </div>
            )}

            {/* Certifications */}
            {employee.certifications && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Certifications</p>
                <p className="text-gray-900 mt-2 whitespace-pre-wrap">{employee.certifications}</p>
              </div>
            )}

            {/* Notes */}
            {employee.notes && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Notes</p>
                <p className="text-gray-900 mt-2 whitespace-pre-wrap">{employee.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Created: {new Date(employee.createdAt || "").toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
