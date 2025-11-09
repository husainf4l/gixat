"use client";

import { useState } from "react";
import { graphqlRequest } from "@/lib/graphql-client";
import { storage } from "@/lib/storage";

interface AddRepairSessionProps {
  carId: string;
  carName: string;
  onSessionAdded?: (session: any) => void;
  onClose?: () => void;
}

interface RepairFormData {
  customerRequest: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  problemDescription: string;
  expectedDeliveryDate: string;
  customerNotes: string;
}

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function AddRepairSession({
  carId,
  carName,
  onSessionAdded,
  onClose,
}: AddRepairSessionProps) {
  const [formData, setFormData] = useState<RepairFormData>({
    customerRequest: "",
    priority: "NORMAL",
    problemDescription: "",
    expectedDeliveryDate: "",
    customerNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = storage.getAccessToken();
      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const user = storage.getUser();
      if (!user) {
        setError("User information not found.");
        return;
      }

      // Build input object, only include expectedDeliveryDate if provided
      const input: any = {
        customerRequest: formData.customerRequest,
        priority: formData.priority,
        problemDescription: formData.problemDescription || null,
        customerNotes: formData.customerNotes || null,
        carId: carId,
        businessId: user.id || user.businessId,
        // IMPORTANT: Only add expectedDeliveryDate if provided, as DateTime scalar is optional
        ...(formData.expectedDeliveryDate && {
          expectedDeliveryDate: `${formData.expectedDeliveryDate}T00:00:00Z`,
        }),
      };

      console.log("Creating repair session with input:", JSON.stringify(input, null, 2));

      // Create repair session via GraphQL mutation
      const response = await graphqlRequest<{ createRepairSession: any }>(
        `mutation($input: CreateRepairSessionInput!) {
          createRepairSession(input: $input) {
            id
            sessionNumber
            customerRequest
            problemDescription
            status
            priority
            carId
            businessId
            createdAt
            displayName
          }
        }`,
        { input },
        token
      );

      if (response.data?.createRepairSession) {
        const newSession = response.data.createRepairSession;
        if (onSessionAdded) {
          onSessionAdded(newSession);
        }
        // Reset form
        setFormData({
          customerRequest: "",
          priority: "NORMAL",
          problemDescription: "",
          expectedDeliveryDate: "",
          customerNotes: "",
        });
        alert("Repair session created successfully!");
        if (onClose) {
          onClose();
        }
      } else if (response.errors) {
        setError(
          `Error: ${response.errors[0]?.message || "Failed to create repair session"}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the repair session"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Create Repair Session</h3>
          <p className="text-sm text-gray-600">Start a repair session for {carName}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Request */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Request *
            </label>
            <textarea
              name="customerRequest"
              value={formData.customerRequest}
              onChange={handleInputChange}
              required
              placeholder="What does the customer want us to repair or service?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Expected Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Delivery Date
            </label>
            <input
              type="date"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Problem Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Problem Description
            </label>
            <textarea
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleInputChange}
              placeholder="Detailed description of the problem or issue"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Customer Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Notes
            </label>
            <textarea
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleInputChange}
              placeholder="Any additional notes or special requests from the customer"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create Repair Session"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
