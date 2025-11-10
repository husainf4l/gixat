"use client";

import { useState, useEffect } from "react";
import { graphqlRequest } from "@/lib/graphql-client";
import { storage } from "@/lib/storage";
import { GET_CARS_IN_GARAGE_QUERY } from "@/lib/dashboard.queries";

interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  status: string;
  clientId: string;
  displayName: string;
}

interface CarsInGarageProps {
  isCollapsed: boolean;
}

export default function CarsInGarage({ isCollapsed }: CarsInGarageProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(!isCollapsed);

  useEffect(() => {
    // Update expanded state when collapsed state changes
    setExpanded(!isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    fetchCarsInGarage();
  }, []);

  const fetchCarsInGarage = async () => {
    try {
      const token = storage.getAccessToken();
      const user = storage.getUser();

      if (!token || !user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      // Get user's business ID (use user.id as businessId)
      const userBusinessId = (user as any)?.id;
      if (!userBusinessId) {
        setError("No business found");
        setLoading(false);
        return;
      }

      const response = await graphqlRequest<{ carsByBusiness: Car[] }>(
        GET_CARS_IN_GARAGE_QUERY,
        { businessId: userBusinessId },
        token
      );

      if (response.data?.carsByBusiness) {
        // Filter cars that are in repair/garage status
        const garageStatus = [
          "IN_REPAIR",
          "IN_GARAGE",
          "IN_PROGRESS",
          "REPAIR_IN_PROGRESS",
          "BEING_SERVICED",
        ];
        const filteredCars = response.data.carsByBusiness.filter((car) =>
          garageStatus.some((status) =>
            car.status?.toUpperCase().includes(status)
          )
        );
        setCars(filteredCars);
      }

      if (response.errors) {
        console.error("GraphQL errors:", response.errors);
        setError("Failed to load cars");
      }
    } catch (err) {
      console.error("Error fetching cars in garage:", err);
      setError("Error loading garage");
    } finally {
      setLoading(false);
    }
  };

  // Status color mapping
  const getStatusColor = (status: string): string => {
    const statusUpper = status?.toUpperCase() || "";
    if (statusUpper.includes("REPAIR") || statusUpper.includes("PROGRESS")) {
      return "bg-yellow-100 text-yellow-800";
    } else if (statusUpper.includes("GARAGE")) {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="px-2 py-2">
        <div className="text-xs text-gray-500 px-3 py-2">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-2 py-2">
      {/* Collapsible Section Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        title={isCollapsed ? "Cars in Garage" : ""}
      >
        <span className="text-lg flex-shrink-0">🚗</span>
        {!isCollapsed && (
          <>
            <span className="text-sm font-medium text-gray-700 flex-1 text-left">
              Cars in Garage
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </>
        )}
      </button>

      {/* Expanded Content */}
      {expanded && !isCollapsed && (
        <div className="mt-2 space-y-1 max-h-96 overflow-y-auto">
          {error && (
            <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded">
              {error}
            </div>
          )}

          {cars.length === 0 && !error && (
            <div className="px-3 py-2 text-xs text-gray-500">
              No cars in garage
            </div>
          )}

          {cars.map((car) => (
            <div
              key={car.id}
              className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-xs"
              title={`${car.make} ${car.model} - ${car.licensePlate}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {car.make} {car.model}
                  </p>
                  <p className="text-gray-600 truncate">{car.licensePlate}</p>
                  <p className="text-gray-500 text-xs mt-1">{car.year}</p>
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    car.status
                  )}`}
                >
                  {car.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
