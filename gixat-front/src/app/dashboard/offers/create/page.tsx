"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import DashboardLayout from "@/components/DashboardLayout";

interface CreateQuoteForm {
  title: string;
  description: string;
  clientId: string;
  carId: string;
  laborCost: string;
  partsCost: string;
  discountPercentage: string;
  validUntil: string;
  notes: string;
}

export default function CreateQuotePage() {
  const router = useRouter();
  const user = storage.getUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateQuoteForm>({
    title: "",
    description: "",
    clientId: "",
    carId: "",
    laborCost: "",
    partsCost: "",
    discountPercentage: "0",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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

  const calculateTotalCost = () => {
    const labor = parseFloat(formData.laborCost) || 0;
    const parts = parseFloat(formData.partsCost) || 0;
    const subtotal = labor + parts;
    const discount = (subtotal * parseFloat(formData.discountPercentage)) / 100 || 0;
    return (subtotal - discount).toFixed(2);
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
      const savedOffers = localStorage.getItem("offers");
      const offers = savedOffers ? JSON.parse(savedOffers) : [];
      
      const labor = parseFloat(formData.laborCost) || 0;
      const parts = parseFloat(formData.partsCost) || 0;
      const subtotal = labor + parts;
      const discount = (subtotal * parseFloat(formData.discountPercentage)) / 100 || 0;
      const finalAmount = subtotal - discount;

      // Create new quote object
      const newQuote = {
        id: `qte-${Date.now()}`,
        offerNumber: `QTE-${String(offers.length + 1).padStart(4, '0')}`,
        title: formData.title,
        description: formData.description,
        clientId: formData.clientId,
        carId: formData.carId,
        laborCost: labor,
        partsCost: parts,
        totalCost: subtotal,
        discountPercentage: parseFloat(formData.discountPercentage),
        discountAmount: discount,
        finalAmount: finalAmount,
        validUntil: formData.validUntil,
        notes: formData.notes,
        status: "PENDING",
        isApproved: false,
        isRejected: false,
        isExpired: false,
        createdAt: new Date().toISOString(),
      };

      offers.push(newQuote);
      localStorage.setItem("offers", JSON.stringify(offers));

      // Show success message and redirect
      alert("✅ Quote created successfully!");
      router.push("/dashboard/offers");
    } catch (error) {
      console.error("Error creating quote:", error);
      alert("Failed to create quote");
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
      title="Create Quote"
      subtitle="Generate a new repair estimate"
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
          <p className="text-gray-600 mt-2">Generate a repair estimate for a customer</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-6">
          {/* Row 1: Title and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Engine Oil Change & Filter"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brief Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of services"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Row 2: Client and Car */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID *
              </label>
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                placeholder="e.g., CLN-001"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car ID *
              </label>
              <input
                type="text"
                name="carId"
                value={formData.carId}
                onChange={handleInputChange}
                placeholder="e.g., CAR-001"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Row 3: Labor and Parts Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labor Cost ($) *
              </label>
              <input
                type="number"
                name="laborCost"
                value={formData.laborCost}
                onChange={handleInputChange}
                placeholder="e.g., 50.00"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parts Cost ($) *
              </label>
              <input
                type="number"
                name="partsCost"
                value={formData.partsCost}
                onChange={handleInputChange}
                placeholder="e.g., 25.00"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Row 4: Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%) - Optional
              </label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                placeholder="e.g., 10"
                step="0.01"
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Cost
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-bold">
                ${calculateTotalCost()}
              </div>
            </div>
          </div>

          {/* Row 5: Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quote Valid Until
            </label>
            <input
              type="date"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional information, terms, or conditions..."
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
              {loading ? "Creating..." : "✅ Create Quote"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
