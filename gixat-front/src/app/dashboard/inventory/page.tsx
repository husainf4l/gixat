"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";
import { storage } from "@/lib/storage";
import type { User } from "@/lib/auth.types";

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

export default function InventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = storage.getUser();
    const token = storage.getAccessToken();
    
    if (!userData || !token) {
      router.push("/auth/login");
      return;
    }
    
    setUser(userData);
    setPageLoading(false);
  }, [router]);

  useEffect(() => {
    if (pageLoading || !user) {
      return;
    }

    const fetchInventory = () => {
      try {
        const savedItems = localStorage.getItem("inventory");
        const itemList: InventoryItem[] = savedItems ? JSON.parse(savedItems) : [];
        setItems(itemList);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [pageLoading, user]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleAddItem = () => {
    router.push("/dashboard/inventory/create");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "IN_STOCK": "bg-green-100 text-green-800",
      "LOW_STOCK": "bg-yellow-100 text-yellow-800",
      "OUT_OF_STOCK": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2);
  };

  const getLowStockCount = () => {
    return items.filter(item => item.status === "LOW_STOCK" || item.quantity <= item.reorderLevel).length;
  };

  if (pageLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout
      userRole={user.type === "BUSINESS" ? "owner" : "client"}
      userType={user.type}
      userName={user.name || "User"}
      onLogout={handleLogout}
      title="Inventory / Parts"
      subtitle="Manage spare parts and inventory stock"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory / Parts</h1>
            <p className="text-gray-600 mt-2">
              {items.length > 0 ? `${items.length} part(s) in inventory` : "Manage spare parts and inventory stock"}
            </p>
          </div>
          <button 
            onClick={handleAddItem}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition font-medium border border-gray-200"
          >
            Add Part
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Parts</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "..." : items.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{loading ? "..." : getLowStockCount()}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">${loading ? "..." : getTotalValue()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by part name..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <input
              type="text"
              placeholder="Filter by category..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300">
              <option>Filter by Status</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
            <button className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition font-medium border border-gray-200">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {items.length === 0 ? (
            <table className="w-full">
              <TableHeader columns={["Part Name", "Category", "Quantity", "Unit Price", "Status"]} />
              <tbody>
                <tr>
                  <td colSpan={5} className="px-6 py-8">
                    <EmptyState
                      icon=""
                      title="No Parts in Inventory"
                      description="Your inventory is empty. Click 'Add Part' to add spare parts to your inventory."
                      buttonLabel="Add First Part"
                      onButtonClick={handleAddItem}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <>
              <table className="w-full">
                <TableHeader columns={["Part Name", "Category", "Quantity", "Unit Price", "Status"]} />
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => router.push(`/dashboard/inventory/${item.id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.partName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
