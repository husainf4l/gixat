"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { storage } from "@/lib/storage";
import DashboardLayout from "@/components/DashboardLayout";

interface Appointment {
  id: string;
  appointmentNumber: string;
  title: string;
  status: string;
  type?: string;
  priority?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedDuration?: number;
  clientId?: string;
  carId?: string;
  description?: string;
  createdAt?: string;
}

interface EditForm {
  title: string;
  status: string;
  type: string;
  priority: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: string;
  clientId: string;
  carId: string;
  description: string;
}

export default function AppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const user = storage.getUser();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState<EditForm>({
    title: "",
    status: "SCHEDULED",
    type: "SERVICE",
    priority: "MEDIUM",
    scheduledDate: "",
    scheduledTime: "",
    estimatedDuration: "30",
    clientId: "",
    carId: "",
    description: "",
  });

  useEffect(() => {
    const fetchAppointment = () => {
      try {
        const savedAppointments = localStorage.getItem("appointments");
        if (savedAppointments) {
          const appointments = JSON.parse(savedAppointments);
          const found = appointments.find((apt: Appointment) => apt.id === appointmentId);
          
          if (found) {
            setAppointment(found);
            setFormData({
              title: found.title,
              status: found.status,
              type: found.type || "SERVICE",
              priority: found.priority || "MEDIUM",
              scheduledDate: found.scheduledDate || "",
              scheduledTime: found.scheduledTime || "",
              estimatedDuration: String(found.estimatedDuration || 30),
              clientId: found.clientId || "",
              carId: found.carId || "",
              description: found.description || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

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
      const savedAppointments = localStorage.getItem("appointments");
      if (savedAppointments) {
        const appointments = JSON.parse(savedAppointments);
        const index = appointments.findIndex((apt: Appointment) => apt.id === appointmentId);
        
        if (index !== -1) {
          appointments[index] = {
            ...appointments[index],
            title: formData.title,
            status: formData.status,
            type: formData.type,
            priority: formData.priority,
            scheduledDate: formData.scheduledDate,
            scheduledTime: formData.scheduledTime,
            estimatedDuration: parseInt(formData.estimatedDuration),
            clientId: formData.clientId,
            carId: formData.carId,
            description: formData.description,
          };
          
          localStorage.setItem("appointments", JSON.stringify(appointments));
          setAppointment(appointments[index]);
          setIsEditing(false);
          alert("✅ Appointment updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Failed to save appointment");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        const savedAppointments = localStorage.getItem("appointments");
        if (savedAppointments) {
          const appointments = JSON.parse(savedAppointments);
          const filtered = appointments.filter((apt: Appointment) => apt.id !== appointmentId);
          localStorage.setItem("appointments", JSON.stringify(filtered));
          alert("✅ Appointment deleted successfully!");
          router.push("/dashboard/appointments");
        }
      } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Failed to delete appointment");
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

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-700">Appointment not found</div>
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
      title="Appointment Details"
      subtitle={`${appointment.appointmentNumber} - ${appointment.title}`}
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{appointment.appointmentNumber}</h1>
            <p className="text-gray-600 mt-2">{appointment.title}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition font-medium border border-gray-200"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 transition font-medium border border-red-200"
                >
                  🗑️ Delete
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
            {/* Row 1: Title and Status */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Row 2: Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="SERVICE">Service</option>
                  <option value="INSPECTION">Inspection</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="REPAIR">Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Row 3: Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Row 4: Duration, Client ID, Car ID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (minutes)
                </label>
                <input
                  type="number"
                  name="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car ID
                </label>
                <input
                  type="text"
                  name="carId"
                  value={formData.carId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Row 5: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description/Notes
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
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
                {saveLoading ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Status</p>
                  <p className="text-lg text-gray-900 mt-1">{appointment.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Type</p>
                  <p className="text-lg text-gray-900 mt-1">{appointment.type || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Priority</p>
                  <p className="text-lg text-gray-900 mt-1">{appointment.priority || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Scheduled Date</p>
                  <p className="text-lg text-gray-900 mt-1">{appointment.scheduledDate || "N/A"}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Scheduled Time</p>
                  <p className="text-lg text-gray-900 mt-1">{appointment.scheduledTime || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Estimated Duration</p>
                  <p className="text-lg text-gray-900 mt-1">{appointment.estimatedDuration ? `${appointment.estimatedDuration} minutes` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Client ID</p>
                  <p className="text-lg text-gray-900 mt-1">{appointment.clientId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Car ID</p>
                  <p className="text-lg text-gray-900 mt-1">{appointment.carId || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {appointment.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Description</p>
                <p className="text-gray-900 mt-2 whitespace-pre-wrap">{appointment.description}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Created: {new Date(appointment.createdAt || "").toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
