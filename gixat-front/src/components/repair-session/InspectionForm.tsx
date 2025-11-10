"use client";

import { useState, useEffect } from "react";
import { graphqlRequest } from "@/lib/graphql-client";
import { storage } from "@/lib/storage";
import { CREATE_INSPECTION_MUTATION } from "@/lib/dashboard.queries";
import { useEmployeesByBusiness } from "@/lib/hooks/useEmployees";

interface InspectionFormProps {
  repairSessionId: string;
  businessId: string;
  onSuccess?: () => void;
}

export default function InspectionForm({ repairSessionId, businessId, onSuccess }: InspectionFormProps) {
  const { employees, loading: employeesLoading } = useEmployeesByBusiness(businessId);
  const [formData, setFormData] = useState({
    type: "INITIAL",
    title: "",
    findings: "",
    passed: true,
    inspectorId: "",
    recommendations: "",
    mileageAtInspection: 0,
    technicalNotes: "",
  });

  // Auto-populate inspectorId with first available employee
  useEffect(() => {
    if (employees.length > 0 && !formData.inspectorId) {
      setFormData(prev => ({
        ...prev,
        inspectorId: employees[0].id,
      }));
    }
  }, [employees]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = storage.getAccessToken();
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const inputData = {
        repairSessionId: repairSessionId,
        type: formData.type,
        title: formData.title,
        findings: formData.findings,
        passed: formData.passed,
        recommendations: formData.recommendations,
        mileageAtInspection: formData.mileageAtInspection,
        technicalNotes: formData.technicalNotes,
        // Only include inspectorId if it's not empty
        ...(formData.inspectorId ? { inspectorId: formData.inspectorId } : {}),
      };

      const response = await graphqlRequest(
        CREATE_INSPECTION_MUTATION,
        {
          input: inputData,
          businessId: businessId,
        },
        token
      );

      console.log("InspectionForm - Response:", response);

      if (response.errors) {
        const errorMsg = response.errors[0]?.message || "Failed to create inspection";
        console.error("InspectionForm - GraphQL Error:", errorMsg);
        setError(errorMsg);
        return;
      }

      if (!(response.data as any)?.createInspection) {
        console.error("InspectionForm - No data returned");
        setError("No response data from server");
        return;
      }

      setSuccess(true);
      setFormData({
        type: "INITIAL",
        title: "",
        findings: "",
        passed: true,
        inspectorId: "",
        recommendations: "",
        mileageAtInspection: 0,
        technicalNotes: "",
      });

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error("Error creating inspection:", err);
      const errorMessage = err instanceof Error ? err.message : "Error creating inspection. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔍</span>
        <h3 className="text-lg font-semibold text-gray-900">Inspection Report</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded border border-green-200">
          ✅ Inspection saved successfully!
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Inspection Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="INITIAL">Initial Inspection</option>
            <option value="TEST_DRIVE">Test Drive Inspection</option>
            <option value="QUALITY_CHECK">Quality Check</option>
            <option value="FINAL">Final Inspection</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Inspector (optional)</label>
          {employeesLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500">
              Loading inspectors...
            </div>
          ) : employees.length > 0 ? (
            <select
              name="inspectorId"
              value={formData.inspectorId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select an inspector --</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.email}) - {employee.type}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-orange-600">
              No employees available
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Inspection Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Engine Diagnostics"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Mileage at Inspection</label>
          <input
            type="number"
            name="mileageAtInspection"
            value={formData.mileageAtInspection}
            onChange={(e) => setFormData(prev => ({ ...prev, mileageAtInspection: Number(e.target.value) }))}
            placeholder="Enter mileage in km"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border-2 border-purple-300 rounded-lg hover:bg-purple-50">
            <input
              type="checkbox"
              name="passed"
              checked={formData.passed}
              onChange={(e) => setFormData(prev => ({ ...prev, passed: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Passed ✓</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Findings *</label>
        <textarea
          name="findings"
          value={formData.findings}
          onChange={handleChange}
          placeholder="Detail all findings from inspection"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Recommendations</label>
        <textarea
          name="recommendations"
          value={formData.recommendations}
          onChange={handleChange}
          placeholder="List recommended actions"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Technical Notes</label>
        <textarea
          name="technicalNotes"
          value={formData.technicalNotes}
          onChange={handleChange}
          placeholder="Any technical details or observations"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition font-medium"
      >
        {loading ? "Saving..." : "💾 Save Inspection Report"}
      </button>
    </form>
  );
}
