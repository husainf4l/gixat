"use client";

import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { GET_CLIENT_CARS_QUERY } from "@/lib/dashboard.queries";

interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  status: string;
  mileage?: number;
  insuranceExpiryDate?: string;
}

export default function MyCarsFPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const token = storage.getAccessToken();
        if (!token) return;

        const response = await graphqlRequest<{ carsByClient: Car[] }>(
          GET_CLIENT_CARS_QUERY,
          undefined,
          token
        );

        if (response.data?.carsByClient) {
          setCars(response.data.carsByClient);
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: "bg-green-100 text-green-800",
      IN_SERVICE: "bg-blue-100 text-blue-800",
      MAINTENANCE: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const isInsuranceExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Cars</h1>
            <p className="text-gray-600 mt-2">
              {cars.length > 0 ? `You have ${cars.length} car(s)` : "View and manage all your registered vehicles"}
            </p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            ➕ Add Car
          </button>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-4 bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : cars.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <EmptyState
                icon="🚗"
                title="No Cars Yet"
                description="You haven't registered any cars yet. Click 'Add Car' to add your first vehicle and track its service history."
                buttonLabel="Register First Car"
                onButtonClick={() => {}}
              />
            </div>
          ) : (
            cars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{car.licensePlate}</h3>
                    <p className="text-sm text-gray-600">
                      {car.make} {car.model} • {car.year}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>
                    {car.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-center gap-2">
                    <span>🎨</span>
                    <span>{car.color || "Unknown Color"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>⏱️</span>
                    <span>{car.mileage ? `${car.mileage.toLocaleString()} km` : "Mileage not recorded"}</span>
                  </p>
                  {isInsuranceExpiringSoon(car.insuranceExpiryDate) && (
                    <p className="flex items-center gap-2 text-orange-600 font-medium">
                      <span>⚠️</span>
                      <span>Insurance expiring soon</span>
                    </p>
                  )}
                </div>

                <button className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                  View Service History
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
