"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { User } from "@/lib/auth.types";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { TableHeader, TablePagination } from "@/components/Table";
import { GET_BUSINESS_CARS_QUERY } from "@/lib/dashboard.queries";

interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  status: string;
  mileage?: number;
  registrationDate?: string;
  insuranceExpiryDate?: string;
}

export default function CarsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    make: "",
    search: "",
  });

  // Authentication check - runs on mount
  useEffect(() => {
    const storedUser = storage.getUser();
    const accessToken = storage.getAccessToken();

    if (!storedUser || !accessToken) {
      router.push("/auth/login");
      return;
    }

    setUser(storedUser);
    setPageLoading(false);
  }, [router]);

  // Fetch cars data - always called, depends on auth state
  useEffect(() => {
    if (pageLoading || !user) {
      return;
    }

    const fetchCars = async () => {
      try {
        const token = storage.getAccessToken();
        if (!token) return;

        const businessId = user.id || "1";
        const response = await graphqlRequest<{ carsByBusiness: Car[] }>(
          GET_BUSINESS_CARS_QUERY,
          { businessId },
          token
        );

        if (response.data?.carsByBusiness) {
          let filtered = response.data.carsByBusiness;

          if (filters.status) {
            filtered = filtered.filter((car) => car.status === filters.status);
          }
          if (filters.make) {
            filtered = filtered.filter((car) =>
              car.make.toLowerCase().includes(filters.make.toLowerCase())
            );
          }
          if (filters.search) {
            filtered = filtered.filter((car) =>
              car.licensePlate.toLowerCase().includes(filters.search.toLowerCase())
            );
          }

          setCars(filtered);
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters, pageLoading, user]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: "bg-green-100 text-green-800",
      IN_SERVICE: "bg-blue-100 text-blue-800",
      MAINTENANCE: "bg-yellow-100 text-yellow-800",
      SOLD: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout
      userRole="owner"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Vehicles"
      subtitle="Manage all vehicles in your garage"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cars in Garage</h1>
            <p className="text-gray-600 mt-2">Manage {cars.length} vehicle(s)</p>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
            ➕ Add Car
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by plate number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="IN_SERVICE">In Service</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
            <input
              type="text"
              placeholder="Filter by make..."
              value={filters.make}
              onChange={(e) => setFilters({ ...filters, make: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {cars.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="🚗"
                title="No Cars in Garage"
                description="You haven't added any cars to your garage yet. Click 'Add Car' to register a vehicle."
                buttonLabel="Add First Car"
                onButtonClick={() => {}}
              />
            </div>
          ) : (
            <>
              <table className="w-full">
                <TableHeader columns={["Plate #", "Make", "Model", "Year", "Status", "Mileage"]} />
                <tbody className="divide-y divide-gray-200">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{car.licensePlate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{car.make}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{car.model}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{car.year}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {car.mileage ? `${car.mileage.toLocaleString()} km` : "N/A"}
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
