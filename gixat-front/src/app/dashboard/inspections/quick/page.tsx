"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { CREATE_INSPECTION_MUTATION, GET_BUSINESS_REPAIR_SESSIONS_QUERY } from "@/lib/dashboard.queries";
import { User } from "@/lib/auth.types";

interface RepairSession {
  id: string;
  sessionNumber: string;
  displayName: string;
  status: string;
  carId: string;
}

const QUICK_INSPECTION_TYPES = [
  { value: "INITIAL", label: "Initial Inspection" },
  { value: "SAFETY", label: "Safety Inspection" },
  { value: "DETAILED", label: "Detailed Inspection" },
  { value: "PRE_DELIVERY", label: "Pre-Delivery Inspection" },
  { value: "FOLLOW_UP", label: "Follow-up Inspection" },
];

export default function QuickInspectionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [repairSessions, setRepairSessions] = useState<RepairSession[]>([]);
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

  // Authentication check
  useEffect(() => {
    const initializePage = async () => {
      try {
        const storedUser = storage.getUser();
        const accessToken = storage.getAccessToken();

        if (!storedUser || !accessToken) {
          router.push("/auth/login");
          return;
        }

        setUser(storedUser);

        // Fetch repair sessions to get available session IDs
        const businessId = storedUser.id || "1";
        const response = await graphqlRequest<{ repairSessions: RepairSession[] }>(
          GET_BUSINESS_REPAIR_SESSIONS_QUERY,
          { businessId },
          accessToken
        );

        if (response.data?.repairSessions) {
          setRepairSessions(response.data.repairSessions);
        }

      } catch (err) {
        console.error("Error loading page data:", err);
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
        repairSessionId: formData.repairSessionId || repairSessions[0]?.id, // Use first available repair session
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
        setSuccess("Quick inspection created successfully!");
        
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
      title="Quick Inspection"
      subtitle="Create a quick vehicle inspection"
    >
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quick Inspection</h1>
              <p className="text-gray-600 mt-2">Fast and simple inspection creation</p>
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
            <div className="flex items-center">
              <span className="text-green-600 mr-2"></span>
              {success}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-red-600 mr-2"></span>
              {error}
            </div>
          </div>
        )}

        {/* No Repair Sessions Warning */}
        {!loading && repairSessions.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-yellow-600 mr-2 mt-0.5"></span>
              <div className="text-yellow-800 text-sm">
                <p className="font-medium mb-1">No Repair Sessions Found</p>
                <p className="mb-2">
                  Inspections must be linked to repair sessions. You need to create a repair session first.
                </p>
                <button
                  onClick={() => router.push("/dashboard/repair-sessions/create")}
                  className="text-yellow-700 underline hover:text-yellow-900"
                >
                  Create a Repair Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Inspection Details</h2>
            <p className="text-gray-600 text-sm">Fill in the essential information for your inspection</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inspection Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {QUICK_INSPECTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Related Repair Session */}
            {repairSessions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Repair Session
                </label>
                <select
                  name="repairSessionId"
                  value={formData.repairSessionId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a repair session (will use first available)</option>
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
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Quick safety inspection for Honda Civic"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Brief description of what was inspected
              </p>
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Mileage
              </label>
              <input
                type="number"
                name="mileageAtInspection"
                value={formData.mileageAtInspection}
                onChange={handleChange}
                placeholder="e.g., 45000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Current odometer reading (optional)
              </p>
            </div>

            {/* Findings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Findings
              </label>
              <textarea
                name="findings"
                value={formData.findings}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the main findings from the inspection..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Recommendations
              </label>
              <textarea
                name="recommendations"
                value={formData.recommendations}
                onChange={handleChange}
                rows={3}
                placeholder="Any immediate recommendations or next steps..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Checkboxes */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Inspection Status</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="passed"
                    checked={formData.passed}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Inspection Passed
                  </label>
                </div>
              </div>
            </div>            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition"
                disabled={submitting}
              >
                Cancel
              </button>
              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Quick Inspection"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-blue-600 mr-2 mt-0.5"></span>
            <div className="text-blue-800 text-sm">
              <p className="font-medium mb-1">Quick Inspection Tips:</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Perfect for routine safety checks and quick assessments</li>
                <li>• For detailed inspections with photos and repair links, use "New Inspection"</li>
                <li>• All quick inspections can be edited later if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}