"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import DashboardLayout from "@/components/DashboardLayout";

interface CreateInventoryForm {
  partName: string;
  category: string;
  quantity: string;
  unitPrice: string;
  reorderLevel: string;
  description: string;
}

export default function CreateInventoryPage() {
  const router = useRouter();
  const user = storage.getUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInventoryForm>({
    partName: "",
    category: "ENGINE",
    quantity: "0",
    unitPrice: "0",
    reorderLevel: "5",
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

  const getStatus = (quantity: number, reorderLevel: number) => {
    if (quantity === 0) return "OUT_OF_STOCK";
    if (quantity <= reorderLevel) return "LOW_STOCK";
    return "IN_STOCK";
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
      const savedItems = localStorage.getItem("inventory");
      const items = savedItems ? JSON.parse(savedItems) : [];
      
      const quantity = parseInt(formData.quantity);
      const reorderLevel = parseInt(formData.reorderLevel);

      // Create new inventory item object
      const newItem = {
        id: `inv-${Date.now()}`,
        partNumber: `PART-${String(items.length + 1).padStart(4, '0')}`,
        partName: formData.partName,
        category: formData.category,
        quantity: quantity,
        unitPrice: parseFloat(formData.unitPrice),
        reorderLevel: reorderLevel,
        status: getStatus(quantity, reorderLevel),
        description: formData.description,
        createdAt: new Date().toISOString(),
      };

      items.push(newItem);
      localStorage.setItem("inventory", JSON.stringify(items));

      // Show success message and redirect
      alert("Inventory item added successfully!");
      router.push("/dashboard/inventory");
    } catch (error) {
      console.error("Error creating inventory item:", error);
      alert("Failed to add inventory item");
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
      title="Add Inventory Item"
      subtitle="Add a new part to inventory"
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Part to Inventory</h1>
          <p className="text-gray-600 mt-2">Fill in the details to add a new spare part to your inventory</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-6">
          {/* Row 1: Part Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part Name *
              </label>
              <input
                type="text"
                name="partName"
                value={formData.partName}
                onChange={handleInputChange}
                placeholder="e.g., Oil Filter"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="ENGINE">Engine</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="SUSPENSION">Suspension</option>
                <option value="BRAKE">Brake</option>
                <option value="COOLING">Cooling</option>
                <option value="TRANSMISSION">Transmission</option>
                <option value="EXHAUST">Exhaust</option>
                <option value="BODY">Body & Trim</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2: Quantity and Unit Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity in Stock *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="e.g., 10"
                step="1"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price ($) *
              </label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleInputChange}
                placeholder="e.g., 25.00"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>

          {/* Row 3: Reorder Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reorder Level (Quantity to trigger low stock alert)
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleInputChange}
              placeholder="e.g., 5"
              step="1"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">When quantity falls below this level, item will be marked as "Low Stock"</p>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional details about this part (part number, supplier, notes, etc.)"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Summary:</p>
            <div className="mt-2 space-y-1 text-sm text-gray-700">
              <p>• Part: <span className="font-medium">{formData.partName || "Not specified"}</span></p>
              <p>• Total Value: <span className="font-medium">${(parseInt(formData.quantity) * parseFloat(formData.unitPrice)).toFixed(2)}</span></p>
              <p>• Status: <span className="font-medium">{getStatus(parseInt(formData.quantity), parseInt(formData.reorderLevel))}</span></p>
            </div>
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
              {loading ? "Adding..." : "Add to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
