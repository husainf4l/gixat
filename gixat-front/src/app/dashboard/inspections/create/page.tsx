"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { CREATE_INSPECTION_MUTATION, GET_BUSINESS_REPAIR_SESSIONS_QUERY, GET_BUSINESS_CARS_QUERY, GET_BUSINESS_CLIENTS_QUERY } from "@/lib/dashboard.queries";
import { User } from "@/lib/auth.types";

interface RepairSession {
  id: string;
  sessionNumber: string;
  displayName: string;
  status: string;
  carId: string;
}

interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const INSPECTION_TYPES = [
  { value: "INITIAL", label: "Initial Inspection" },
  { value: "DETAILED", label: "Detailed Inspection" }, 
  { value: "PRE_DELIVERY", label: "Pre-Delivery Inspection" },
  { value: "SAFETY", label: "Safety Inspection" },
  { value: "FOLLOW_UP", label: "Follow-up Inspection" },
  { value: "FINAL", label: "Final Inspection" }
];

export default function CreateInspectionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [repairSessions, setRepairSessions] = useState<RepairSession[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    type: "INITIAL",
    title: "",
    findings: "",
    recommendations: "",
    mileageAtInspection: "",
    technicalNotes: "",
    passed: true,
    repairSessionId: "",
  });

  // Authentication and data loading
  useEffect(() => {
    const initializePage = async () => {
      try {
        const storedUser = storage.getUser();
        const token = storage.getAccessToken();

        if (!storedUser || !token) {
          router.push("/auth/login");
          return;
        }

        setUser(storedUser);

        // Get business ID
        const businessId = storedUser.id || "1";

        // Fetch repair sessions, cars, and clients
        const [repairSessionsResponse, carsResponse, clientsResponse] = await Promise.all([
          graphqlRequest<{ repairSessions: RepairSession[] }>(
            GET_BUSINESS_REPAIR_SESSIONS_QUERY,
            { businessId },
            token
          ),
          graphqlRequest<{ carsByBusiness: Car[] }>(
            GET_BUSINESS_CARS_QUERY,
            { businessId },
            token
          ),
          graphqlRequest<{ clientsByBusiness: Client[] }>(
            GET_BUSINESS_CLIENTS_QUERY,
            { businessId },
            token
          )
        ]);

        if (repairSessionsResponse.data?.repairSessions) {
          setRepairSessions(repairSessionsResponse.data.repairSessions);
        }
        if (carsResponse.data?.carsByBusiness) {
          setCars(carsResponse.data.carsByBusiness);
        }
        if (clientsResponse.data?.clientsByBusiness) {
          setClients(clientsResponse.data.clientsByBusiness);
        }

      } catch (err) {
        console.error("Error initializing page:", err);
        setError("Failed to load page data");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("User not authenticated");
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.type) {
      setError("Inspection type is required");
      return;
    }

    // Check if we have repair sessions available
    if (repairSessions.length === 0) {
      setError("No repair sessions available. Please create a repair session first.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const token = storage.getAccessToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      
      const businessId = user.id || "1";

      const inspectionInput = {
        repairSessionId: formData.repairSessionId || repairSessions[0]?.id, // Use first available or selected
        type: formData.type,
        title: formData.title.trim(),
        findings: formData.findings.trim(),
        recommendations: formData.recommendations.trim(),
        mileageAtInspection: formData.mileageAtInspection ? parseFloat(formData.mileageAtInspection) : null,
        technicalNotes: formData.technicalNotes.trim(),
        passed: formData.passed,
        // Only include inspectorId if it's not empty
        ...(user.id ? { inspectorId: user.id } : {}),
      };

      const response = await graphqlRequest<{ createInspection: any }>(
        CREATE_INSPECTION_MUTATION,
        {
          input: inspectionInput,
          businessId: businessId,
        },
        token
      );

      if (response.data?.createInspection) {
        setSuccess("Inspection created successfully!");
        
        // Redirect to inspections list after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/inspections");
        }, 2000);
      } else {
        throw new Error("Failed to create inspection");
      }

    } catch (err) {
      console.error("Error creating inspection:", err);
      setError(err instanceof Error ? err.message : "Failed to create inspection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/inspections");
  };

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
      title="Create Inspection"
      subtitle="Create a new vehicle inspection"
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Inspection</h1>
              <p className="text-gray-600 mt-2">Fill out the form below to create a new vehicle inspection</p>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              ← Back to Inspections
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {INSPECTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Pre-delivery inspection for Toyota Camry"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Optional Repair Session */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Repair Session (Optional)
              </label>
              <select
                name="repairSessionId"
                value={formData.repairSessionId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No repair session</option>
                {repairSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.displayName || `Session #${session.sessionNumber}`}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Link this inspection to an existing repair session
              </p>
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mileage at Inspection
              </label>
              <input
                type="number"
                name="mileageAtInspection"
                value={formData.mileageAtInspection}
                onChange={handleChange}
                placeholder="e.g., 45000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Findings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Findings
              </label>
              <textarea
                name="findings"
                value={formData.findings}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what was found during the inspection..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations
              </label>
              <textarea
                name="recommendations"
                value={formData.recommendations}
                onChange={handleChange}
                rows={3}
                placeholder="Recommended actions or repairs..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Technical Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technical Notes
              </label>
              <textarea
                name="technicalNotes"
                value={formData.technicalNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional technical observations..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="passed"
                  checked={formData.passed}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Inspection Passed
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Inspection"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}