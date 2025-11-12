"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { storage } from "@/lib/storage";
import DashboardLayout from "@/components/DashboardLayout";

interface InventoryItem {
  id: string;
  partNumber: string;
  partName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  status: string;
  description?: string;
  createdAt?: string;
}

interface EditForm {
  partName: string;
  category: string;
  quantity: string;
  unitPrice: string;
  reorderLevel: string;
  description: string;
}

export default function InventoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const user = storage.getUser();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState<EditForm>({
    partName: "",
    category: "ENGINE",
    quantity: "0",
    unitPrice: "0",
    reorderLevel: "5",
    description: "",
  });

  useEffect(() => {
    const fetchItem = () => {
      try {
        const savedItems = localStorage.getItem("inventory");
        if (savedItems) {
          const items = JSON.parse(savedItems);
          const found = items.find((i: InventoryItem) => i.id === itemId);
          
          if (found) {
            setItem(found);
            setFormData({
              partName: found.partName,
              category: found.category,
              quantity: String(found.quantity),
              unitPrice: String(found.unitPrice),
              reorderLevel: String(found.reorderLevel),
              description: found.description || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching inventory item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "IN_STOCK": "bg-green-100 text-green-800",
      "LOW_STOCK": "bg-yellow-100 text-yellow-800",
      "OUT_OF_STOCK": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const savedItems = localStorage.getItem("inventory");
      if (savedItems) {
        const items = JSON.parse(savedItems);
        const index = items.findIndex((i: InventoryItem) => i.id === itemId);
        
        if (index !== -1) {
          const quantity = parseInt(formData.quantity);
          const reorderLevel = parseInt(formData.reorderLevel);

          items[index] = {
            ...items[index],
            partName: formData.partName,
            category: formData.category,
            quantity: quantity,
            unitPrice: parseFloat(formData.unitPrice),
            reorderLevel: reorderLevel,
            status: getStatus(quantity, reorderLevel),
            description: formData.description,
          };
          
          localStorage.setItem("inventory", JSON.stringify(items));
          setItem(items[index]);
          setIsEditing(false);
          alert("✅ Inventory item updated successfully!");
        }
      }
    } catch (error) {
      console.error("Error saving inventory item:", error);
      alert("Failed to save inventory item");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      try {
        const savedItems = localStorage.getItem("inventory");
        if (savedItems) {
          const items = JSON.parse(savedItems);
          const filtered = items.filter((i: InventoryItem) => i.id !== itemId);
          localStorage.setItem("inventory", JSON.stringify(filtered));
          alert("✅ Inventory item deleted successfully!");
          router.push("/dashboard/inventory");
        }
      } catch (error) {
        console.error("Error deleting inventory item:", error);
        alert("Failed to delete inventory item");
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

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-700">Item not found</div>
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
      title="Inventory Item Details"
      subtitle={`${item.partNumber} - ${item.partName}`}
    >
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{item.partName}</h1>
            <p className="text-gray-600 mt-2">{item.partNumber} • {item.category}</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
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
                  Quantity in Stock
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  step="1"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Row 3: Reorder Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Level
              </label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleInputChange}
                step="1"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
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
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Category</p>
                  <p className="text-lg text-gray-900 mt-1">{item.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Quantity in Stock</p>
                  <p className="text-lg text-gray-900 mt-1">{item.quantity} units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Unit Price</p>
                  <p className="text-lg text-gray-900 mt-1">${item.unitPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Value</p>
                  <p className="text-lg text-gray-900 mt-1">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Reorder Level</p>
                  <p className="text-lg text-gray-900 mt-1">{item.reorderLevel} units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Part Number</p>
                  <p className="text-lg text-gray-900 mt-1">{item.partNumber}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Description</p>
                <p className="text-gray-900 mt-2 whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Created: {new Date(item.createdAt || "").toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
