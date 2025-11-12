"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import DashboardLayout from "@/components/DashboardLayout";

interface CreateEmployeeForm {
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

export default function CreateEmployeePage() {
  const router = useRouter();
  const user = storage.getUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEmployeeForm>({
    name: "",
    email: "",
    phone: "",
    position: "TECHNICIAN",
    specialization: "GENERAL",
    status: "ACTIVE",
    joinDate: new Date().toISOString().split("T")[0],
    salary: "",
    experience: "",
    certifications: "",
    address: "",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = storage.getAccessToken();
      if (!token) {
        alert("Authentication required");
        router.push("/auth/login");
        return;
      }

      // Save to localStorage for development/testing
      const savedEmployees = localStorage.getItem("employees");
      const employees = savedEmployees ? JSON.parse(savedEmployees) : [];
      
      // Create new employee object
      const newEmployee = {
        id: `emp-${Date.now()}`,
        employeeNumber: `EMP-${String(employees.length + 1).padStart(4, '0')}`,
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
        createdAt: new Date().toISOString(),
      };

      employees.push(newEmployee);
      localStorage.setItem("employees", JSON.stringify(employees));

      // Show success message and redirect
      alert("✅ Employee added successfully!");
      router.push("/dashboard/employees");
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DashboardLayout
      userRole="owner"
      userType={user?.type || "BUSINESS"}
      userName={user?.name || "User"}
      onLogout={() => {
        storage.clearAuth();
        router.push("/auth/login");
      }}
      title="Add Employee"
      subtitle="Register a new employee or technician"
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-600 mt-2">Fill in the details to register a new staff member</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-6">
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
                placeholder="e.g., Ahmed Hassan"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                placeholder="ahmed@garage.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                placeholder="+1 (555) 000-0000"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
                placeholder="e.g., 5"
                min="0"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
              placeholder="e.g., 2500"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
              placeholder="Street address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
              placeholder="List any certifications or qualifications (e.g., ASE Certified, etc.)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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
              placeholder="Any additional information or notes about this employee..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              {loading ? "Adding..." : "✅ Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
