"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import DashboardLayout from "@/components/DashboardLayout";

interface CreateAppointmentForm {
  title: string;
  appointmentNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: string;
  type: string;
  priority: string;
  clientId: string;
  carId: string;
  description: string;
}

export default function CreateAppointmentPage() {
  const router = useRouter();
  const user = storage.getUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentForm>({
    title: "",
    appointmentNumber: "",
    scheduledDate: "",
    scheduledTime: "",
    estimatedDuration: "30",
    type: "SERVICE",
    priority: "MEDIUM",
    clientId: "",
    carId: "",
    description: "",
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
      const savedAppointments = localStorage.getItem("appointments");
      const appointments = savedAppointments ? JSON.parse(savedAppointments) : [];
      
      // Create new appointment object
      const newAppointment = {
        id: `apt-${Date.now()}`,
        appointmentNumber: `APT-${String(appointments.length + 1).padStart(4, '0')}`,
        title: formData.title,
        status: "SCHEDULED",
        type: formData.type,
        priority: formData.priority,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        estimatedDuration: parseInt(formData.estimatedDuration),
        clientId: formData.clientId,
        carId: formData.carId,
        description: formData.description,
        createdAt: new Date().toISOString(),
        isUpcoming: true,
        isOverdue: false,
      };

      appointments.push(newAppointment);
      localStorage.setItem("appointments", JSON.stringify(appointments));

      // Show success message and redirect
      alert("Appointment created successfully!");
      router.push("/dashboard/appointments");
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to create appointment");
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
      title="Create Appointment"
      subtitle="Schedule a new customer appointment"
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Appointment</h1>
          <p className="text-gray-600 mt-2">Fill in the details to schedule a new appointment</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-6">
          {/* Row 1: Title and Appointment Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Oil Change Service"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Number
              </label>
              <input
                type="text"
                name="appointmentNumber"
                value={formData.appointmentNumber}
                onChange={handleInputChange}
                placeholder="Auto-generated"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Row 2: Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Time *
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Row 3: Duration and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleInputChange}
                placeholder="30"
                min="15"
                max="480"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="SERVICE">Service</option>
                <option value="INSPECTION">Inspection</option>
                <option value="CONSULTATION">Consultation</option>
                <option value="REPAIR">Repair</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Row 4: Priority and Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                placeholder="Select or enter client ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Row 5: Car ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Car ID
            </label>
            <input
              type="text"
              name="carId"
              value={formData.carId}
              onChange={handleInputChange}
              placeholder="Select or enter car ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Row 6: Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add any additional notes or instructions for this appointment..."
              rows={4}
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
              {loading ? "Creating..." : "Create Appointment"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
