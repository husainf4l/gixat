"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import {
  GET_REPAIR_SESSION_DETAIL_QUERY,
  UPDATE_REPAIR_SESSION_STATUS_MUTATION,
} from "@/lib/dashboard.queries";
import JobCardReportForm from "@/components/repair-session/JobCardReportForm";
import InspectionForm from "@/components/repair-session/InspectionForm";

interface RepairSessionDetail {
  id: string;
  sessionNumber: string;
  customerRequest: string;
  problemDescription?: string;
  status: string;
  priority: string;
  carId: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  displayName: string;
  isCompleted: boolean;
  daysInProgress?: number;
  estimatedCost?: number;
  actualCost?: number;
  customerNotes?: string;
  internalNotes?: string;
  assignedTechnicianId?: string;
  createdById: string;
  isActive: boolean;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

const STATUS_OPTIONS = [
  "CUSTOMER_REQUEST",
  "INITIAL_INSPECTION",
  "TEST_DRIVE_INSPECTION",
  "OFFER_PREPARATION",
  "OFFER_SENT",
  "OFFER_APPROVED",
  "OFFER_REJECTED",
  "JOB_CARD_CREATED",
  "REPAIR_IN_PROGRESS",
  "QUALITY_CHECK",
  "FINAL_INSPECTION",
  "READY_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_COLORS: Record<string, string> = {
  CUSTOMER_REQUEST: "bg-blue-100 text-blue-700",
  INITIAL_INSPECTION: "bg-cyan-100 text-cyan-700",
  TEST_DRIVE_INSPECTION: "bg-indigo-100 text-indigo-700",
  OFFER_PREPARATION: "bg-purple-100 text-purple-700",
  OFFER_SENT: "bg-pink-100 text-pink-700",
  OFFER_APPROVED: "bg-green-100 text-green-700",
  OFFER_REJECTED: "bg-red-100 text-red-700",
  JOB_CARD_CREATED: "bg-yellow-100 text-yellow-700",
  REPAIR_IN_PROGRESS: "bg-orange-100 text-orange-700",
  QUALITY_CHECK: "bg-teal-100 text-teal-700",
  FINAL_INSPECTION: "bg-lime-100 text-lime-700",
  READY_FOR_DELIVERY: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function RepairSessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<RepairSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "job-card" | "inspection">("overview");

  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const token = storage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    const userData = storage.getUser();
    setUser(userData);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchSessionDetail();
  }, [user]);

  const fetchSessionDetail = async () => {
    try {
      const token = storage.getAccessToken();
      if (!token) {
        console.error("No token found in storage");
        setError("No authentication token. Please login again.");
        setLoading(false);
        return;
      }

      console.log("Token found, fetching repair session:", { sessionId, tokenLength: token.length });

      const response = await graphqlRequest<{ repairSession: RepairSessionDetail }>(
        GET_REPAIR_SESSION_DETAIL_QUERY,
        {
          id: sessionId,
        },
        token
      );
      
      console.log("Response from repairSession query:", response);

      if (response.data?.repairSession) {
        const sessionData = response.data.repairSession;
        setSession(sessionData);
        setNewStatus(sessionData.status);
        setNotes(sessionData.internalNotes || "");
      } else if (response.errors) {
        console.error("GraphQL Errors:", response.errors);
        const errorMsg = response.errors[0]?.message || "Failed to load session";
        
        // If Unauthorized, suggest re-login
        if (errorMsg === "Unauthorized") {
          setError("Session expired. Please log out and log in again.");
        } else {
          setError(errorMsg);
        }
      } else {
        console.error("No data and no errors in response:", response);
        setError("Repair session not found");
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      setError("Failed to load repair session");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!session) return;

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const token = storage.getAccessToken();
      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const response = await graphqlRequest<{ updateRepairSessionStatus: any }>(
        UPDATE_REPAIR_SESSION_STATUS_MUTATION,
        {
          id: sessionId,
          input: {
            status: newStatus,
            notes: notes || null,
          },
        },
        token
      );

      if (response.data?.updateRepairSessionStatus) {
        setSuccess("Session status updated successfully!");
        // Refresh session data
        setTimeout(() => {
          fetchSessionDetail();
        }, 1000);
      } else if (response.errors) {
        setError(response.errors[0]?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update repair session status");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleBack = () => {
    router.back();
  };

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout
        userName={user?.firstName || "User"}
        userRole={user?.role || "BUSINESS"}
        userType={user?.userType || "BUSINESS"}
        onLogout={handleLogout}
        title="Repair Session"
        subtitle="Loading..."
      >
        <div className="p-6 text-center">
          <p className="text-gray-600">Loading repair session...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout
        userName={user?.firstName || "User"}
        userRole={user?.role || "BUSINESS"}
        userType={user?.userType || "BUSINESS"}
        onLogout={handleLogout}
        title="Repair Session"
        subtitle="Not found"
      >
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Repair session not found</p>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            ← Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={user?.firstName || "User"}
      userRole={user?.role || "BUSINESS"}
      userType={user?.userType || "BUSINESS"}
      onLogout={handleLogout}
      title={`Repair Session ${session.sessionNumber}`}
      subtitle={session.customerRequest}
    >
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          ← Back to Sessions
        </button>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Session Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Current Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      STATUS_COLORS[session.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {session.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <p className="font-medium text-gray-900">{session.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Days In Progress</p>
                  <p className="font-medium text-gray-900">
                    {session.daysInProgress ? Math.floor(session.daysInProgress) : 0} days
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="font-medium text-gray-900">
                    {session.isCompleted ? "✓ Yes" : "✗ No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost & Delivery Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cost & Delivery</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estimated Cost</p>
                  <p className="font-medium text-gray-900">
                    {session.estimatedCost ? `$${session.estimatedCost.toFixed(2)}` : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Actual Cost</p>
                  <p className="font-medium text-gray-900">
                    {session.actualCost ? `$${session.actualCost.toFixed(2)}` : "Not yet"}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-sm text-gray-600 mb-1">Expected Delivery Date</p>
                  <p className="font-medium text-gray-900">
                    {session.expectedDeliveryDate
                      ? new Date(session.expectedDeliveryDate).toLocaleDateString()
                      : "Not scheduled"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Actual Delivery Date</p>
                  <p className="font-medium text-gray-900">
                    {session.actualDeliveryDate
                      ? new Date(session.actualDeliveryDate).toLocaleDateString()
                      : "Not delivered yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Request</p>
                  <p className="font-medium text-gray-900">{session.customerRequest}</p>
                </div>
                {session.problemDescription && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Problem Description</p>
                    <p className="text-gray-700">{session.problemDescription}</p>
                  </div>
                )}
                {session.customerNotes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Notes</p>
                    <p className="text-gray-700">{session.customerNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Created Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(session.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(session.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
               Overview
            </button>
            <button
              onClick={() => setActiveTab("job-card")}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === "job-card"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
               Job Card
            </button>
            <button
              onClick={() => setActiveTab("inspection")}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === "inspection"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              🔍 Inspection
            </button>
          </div>
        </div>

        {/* TAB CONTENT */}
        <div className="mt-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Update Status Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Update Session Status</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any internal notes about this session..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating || newStatus === session.status}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TEST DRIVE TAB REMOVED - Not supported by backend */}

          {/* JOB CARD TAB */}
          {activeTab === "job-card" && (
            <JobCardReportForm
              repairSessionId={sessionId}
              businessId={session.businessId}
              onSuccess={() => {
                setSuccess("Job card saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
              }}
            />
          )}

          {/* INSPECTION TAB */}
          {activeTab === "inspection" && (
            <InspectionForm
              repairSessionId={sessionId}
              businessId={session.businessId}
              onSuccess={() => {
                setSuccess("Inspection saved successfully!");
                setTimeout(() => setSuccess(""), 3000);
              }}
            />
          )}

          {/* CUSTOMER REQUEST TAB REMOVED - Not supported by backend */}
        </div>
      </div>
    </DashboardLayout>
  );
}
