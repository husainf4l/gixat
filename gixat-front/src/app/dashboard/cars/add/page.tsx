"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { User } from "@/lib/auth.types";
import DashboardLayout from "@/components/DashboardLayout";
import { CREATE_CAR_MUTATION } from "@/lib/dashboard.queries";

interface CarFormData {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  fuelType: string;
  transmission: string;
  status: string;
  mileage: number;
  registrationDate: string;
  insuranceExpiryDate: string;
  clientId: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Car makes - exact enum values from backend (30 total)
const CAR_MAKES = [
  "TOYOTA",
  "HONDA",
  "FORD",
  "CHEVROLET",
  "NISSAN",
  "BMW",
  "MERCEDES",
  "AUDI",
  "VOLKSWAGEN",
  "HYUNDAI",
  "KIA",
  "MAZDA",
  "SUBARU",
  "LEXUS",
  "ACURA",
  "INFINITI",
  "CADILLAC",
  "BUICK",
  "GMC",
  "JEEP",
  "DODGE",
  "CHRYSLER",
  "RAM",
  "LINCOLN",
  "VOLVO",
  "JAGUAR",
  "LAND_ROVER",
  "PORSCHE",
  "TESLA",
  "OTHER",
];

// Car colors - exact enum values from backend (16 total)
const CAR_COLORS = [
  "BLACK",
  "WHITE",
  "SILVER",
  "GRAY",
  "RED",
  "BLUE",
  "GREEN",
  "YELLOW",
  "ORANGE",
  "BROWN",
  "PURPLE",
  "PINK",
  "GOLD",
  "BEIGE",
  "OTHER",
];

// Fuel types - exact enum values from backend (7 total)
const FUEL_TYPES = [
  "GASOLINE",
  "DIESEL",
  "HYBRID",
  "ELECTRIC",
  "PLUG_IN_HYBRID",
  "CNG",
  "LPG",
];

// Transmission types - exact enum values from backend (4 total)
const TRANSMISSION_TYPES = [
  "MANUAL",
  "AUTOMATIC",
  "CVT",
  "SEMI_AUTOMATIC",
];

// Car status - exact enum values from backend (5 total)
const CAR_STATUS_OPTIONS = [
  "ACTIVE",
  "IN_SERVICE",
  "INACTIVE",
  "SOLD",
  "SCRAPPED",
];

export default function AddCarPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<CarFormData>({
    licensePlate: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    color: "",
    fuelType: "GASOLINE",
    transmission: "AUTOMATIC",
    status: "ACTIVE",
    mileage: 0,
    registrationDate: "",
    insuranceExpiryDate: "",
    clientId: "",
  });

  // Authentication check
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

  // Fetch clients
  useEffect(() => {
    if (pageLoading || !user) {
      return;
    }

    const fetchClients = async () => {
      setClientsLoading(true);
      try {
        const token = storage.getAccessToken();
        if (!token) return;

        // Try to fetch clients using a simple query
        const query = `
          query {
            clients {
              id
              firstName
              lastName
              email
              phone
            }
          }
        `;

        const response = await graphqlRequest<{ clients: Client[] }>(
          query,
          {},
          token
        );

        if (response.data?.clients) {
          setClients(response.data.clients);
        } else if (response.errors) {
          console.error("GraphQL errors:", response.errors);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, [pageLoading, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "mileage" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.licensePlate || !formData.make || !formData.model || !formData.clientId) {
      alert("❌ Please fill in required fields (License Plate, Make, Model, and Client)");
      return;
    }

    setLoading(true);

    try {
      const token = storage.getAccessToken();
      if (!token) {
        alert("❌ Not authenticated. Please login again.");
        return;
      }

      // Call the createCar mutation
      const response = await graphqlRequest<{ createCar: any }>(
        CREATE_CAR_MUTATION,
        {
          input: {
            licensePlate: formData.licensePlate,
            make: formData.make,
            model: formData.model,
            year: formData.year,
            vin: formData.vin || null,
            color: formData.color,
            fuelType: formData.fuelType,
            transmission: formData.transmission,
            mileage: formData.mileage,
            registrationDate: formData.registrationDate || null,
            insuranceExpiryDate: formData.insuranceExpiryDate || null,
            clientId: formData.clientId,
          },
        },
        token
      );

      if (response.data?.createCar) {
        alert("✅ Car added successfully!");
        // Set flag in sessionStorage to trigger refetch on cars page
        sessionStorage.setItem("refetchCars", "true");
        // Small delay to ensure backend has processed the car
        setTimeout(() => {
          router.push("/dashboard/cars");
        }, 500);
      } else if (response.errors) {
        alert(`❌ Error: ${response.errors[0]?.message || "Failed to add car"}`);
      }
    } catch (error) {
      console.error("Error adding car:", error);
      alert("❌ Failed to add car. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/cars");
  };

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

  return (
    <DashboardLayout
      userRole="owner"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Add Car"
      subtitle="Register a new vehicle in your garage"
    >
      <div className="p-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Car</h1>
          <p className="text-gray-600 mt-2">Register a vehicle in your garage</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client & License Plate Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client *
                </label>
                {clientsLoading ? (
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-500">
                    Loading clients...
                  </div>
                ) : clients.length === 0 ? (
                  <div className="px-4 py-2 border border-red-300 rounded-lg bg-red-50 text-sm text-red-600">
                    No clients available. Please create a client first.
                  </div>
                ) : (
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Plate *
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC-1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* VIN Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VIN (Vehicle Identification Number)
              </label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleInputChange}
                placeholder="e.g., 1HGCM82633A..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Make & Model Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make *
                </label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a make...</option>
                  {CAR_MAKES.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Camry"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Year & Color Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a color...</option>
                  {CAR_COLORS.map((color) => (
                    <option key={color} value={color}>
                      {color.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fuel Type & Transmission Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Type *
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {FUEL_TYPES.map((fuelType) => (
                    <option key={fuelType} value={fuelType}>
                      {fuelType.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission *
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {TRANSMISSION_TYPES.map((transmission) => (
                    <option key={transmission} value={transmission}>
                      {transmission.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status & Mileage Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CAR_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mileage (km)
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Registration & Insurance Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Date
                </label>
                <input
                  type="date"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Expiry Date
                </label>
                <input
                  type="date"
                  name="insuranceExpiryDate"
                  value={formData.insuranceExpiryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {loading ? "Adding..." : "✅ Add Car"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
