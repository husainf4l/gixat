"use client";

import { useState, useEffect } from "react";
import { graphqlRequest } from "@/lib/graphql-client";
import { storage } from "@/lib/storage";
import { CREATE_JOB_CARD_MUTATION } from "@/lib/dashboard.queries";
import { useEmployeesByBusiness } from "@/lib/hooks/useEmployees";
import { formatDateForBackend } from "@/lib/date-utils";

interface JobCardReportFormProps {
  repairSessionId: string;
  businessId: string;
  onSuccess?: () => void;
}

export default function JobCardReportForm({ repairSessionId, businessId, onSuccess }: JobCardReportFormProps) {
  const { employees, loading: employeesLoading } = useEmployeesByBusiness(businessId);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    plannedStartDate: new Date().toISOString(),
    plannedEndDate: new Date().toISOString(),
    estimatedHours: 0,
    workInstructions: "",
    assignedTechnicianId: "", // Will be auto-filled with first available employee
  });

  // Auto-populate assignedTechnicianId with first available employee
  useEffect(() => {
    if (employees.length > 0 && !formData.assignedTechnicianId) {
      setFormData(prev => ({
        ...prev,
        assignedTechnicianId: employees[0].id,
      }));
    }
  }, [employees]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "estimatedHours" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let token = storage.getAccessToken();
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const inputData = {
        repairSessionId: repairSessionId,
        title: formData.title,
        description: formData.description,
        plannedStartDate: formatDateForBackend(formData.plannedStartDate),
        plannedEndDate: formatDateForBackend(formData.plannedEndDate),
        estimatedHours: formData.estimatedHours,
        workInstructions: formData.workInstructions,
        // assignedTechnicianId is required (NON_NULL in schema)
        // Must provide a valid technician ID from the business
        assignedTechnicianId: formData.assignedTechnicianId,
      };

      console.log("JobCardReportForm - Sending data:", JSON.stringify(inputData, null, 2));

      const response = await graphqlRequest(
        CREATE_JOB_CARD_MUTATION,
        {
          input: inputData,
          businessId: businessId,
        },
        token
      );

      console.log("JobCardReportForm - Response:", response);

      if (response.errors) {
        const errorMsg = response.errors[0]?.message || "Failed to create job card";
        console.error("JobCardReportForm - GraphQL Error:", errorMsg);
        setError(errorMsg);
        return;
      }

      if (!(response.data as any)?.createJobCard) {
        console.error("JobCardReportForm - No data returned");
        setError("No response data from server");
        return;
      }

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        plannedStartDate: new Date().toISOString(),
        plannedEndDate: new Date().toISOString(),
        estimatedHours: 0,
        workInstructions: "",
        assignedTechnicianId: "",
      });

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error("Error creating job card:", err);
      const errorMessage = err instanceof Error ? err.message : "Error creating job card. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📋</span>
        <h3 className="text-lg font-semibold text-gray-900">Job Card</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded border border-green-200">
          ✅ Job card saved successfully!
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700">Job Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Engine Service, Brake Replacement"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Start Date *</label>
          <input
            type="datetime-local"
            name="plannedStartDate"
            value={formData.plannedStartDate.slice(0, 16)}
            onChange={(e) => {
              const dateTime = new Date(e.target.value).toISOString();
              setFormData(prev => ({
                ...prev,
                plannedStartDate: dateTime,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">End Date *</label>
          <input
            type="datetime-local"
            name="plannedEndDate"
            value={formData.plannedEndDate.slice(0, 16)}
            onChange={(e) => {
              const dateTime = new Date(e.target.value).toISOString();
              setFormData(prev => ({
                ...prev,
                plannedEndDate: dateTime,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Estimated Hours *</label>
          <input
            type="number"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            placeholder="0"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Assigned Technician *</label>
          {employeesLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500">
              Loading technicians...
            </div>
          ) : employees.length > 0 ? (
            <select
              name="assignedTechnicianId"
              value={formData.assignedTechnicianId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">-- Select a technician --</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.email}) - {employee.type}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-red-500 font-medium">
              ❌ No technicians available - Add employees to this business first
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Work Instructions</label>
        <textarea
          name="workInstructions"
          value={formData.workInstructions}
          onChange={handleChange}
          placeholder="Describe the work to be done"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Additional details about this job card"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium"
      >
        {loading ? "Saving..." : "💾 Save Job Card"}
      </button>
    </form>
  );
}
