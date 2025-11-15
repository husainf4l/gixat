"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { CREATE_REPAIR_SESSION_MUTATION } from "@/lib/dashboard.queries";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  clientId: string;
}

const PRIORITY_OPTIONS = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function CreateRepairSessionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedCarId, setSelectedCarId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    customerRequest: "",
    problemDescription: "",
    priority: "NORMAL",
    expectedDeliveryDate: "",
    customerNotes: "",
  });

  useEffect(() => {
    const token = storage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    const userData = storage.getUser();
    setUser(userData);
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetchClientsAndCars();
  }, [user]);

  const fetchClientsAndCars = async () => {
    try {
      setLoading(true);
      setError("");
      const token = storage.getAccessToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      console.log("Starting to fetch clients and cars...");

      // Try fetching all clients first (like the clients page does)
      const clientsResponse = await graphqlRequest<{
        clients: Client[];
      }>(
        `query {
          clients {
            id
            firstName
            lastName
            email
            phone
          }
        }`,
        {},
        token
      );

      console.log("All clients response:", clientsResponse);

      // Try fetching all cars (without filter)
      const carsResponse = await graphqlRequest<{
        cars: Car[];
      }>(
        `query {
          cars {
            id
            licensePlate
            make
            model
            year
            clientId
          }
        }`,
        {},
        token
      );

      console.log("All cars response:", carsResponse);

      if (clientsResponse.errors && clientsResponse.errors.length > 0) {
        const errorMsg = clientsResponse.errors.map((e) => e.message).join(", ");
        console.error("Clients GraphQL errors:", errorMsg);
        setError("Failed to load clients: " + errorMsg);
        return;
      }

      if (carsResponse.errors && carsResponse.errors.length > 0) {
        const errorMsg = carsResponse.errors.map((e) => e.message).join(", ");
        console.error("Cars GraphQL errors:", errorMsg);
        setError("Failed to load vehicles: " + errorMsg);
        return;
      }

      const allClients = clientsResponse.data?.clients || [];
      const allCars = carsResponse.data?.cars || [];

      console.log("Setting clients:", allClients.length, allClients);
      console.log("Setting cars:", allCars.length, allCars);

      setClients(allClients);
      setCars(allCars);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Exception: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedCarId(""); // Reset car selection
  };

  const handleCarChange = (carId: string) => {
    setSelectedCarId(carId);
  };

  const getAvailableCars = () => {
    if (!selectedClientId) return [];
    return cars.filter((car) => car.clientId === selectedClientId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!selectedClientId) {
      setError("Please select a client");
      return;
    }

    if (!selectedCarId) {
      setError("Please select a vehicle");
      return;
    }

    if (!formData.customerRequest.trim()) {
      setError("Customer request is required");
      return;
    }

    if (!formData.priority) {
      setError("Please select a priority");
      return;
    }

    setSubmitting(true);

    try {
      const token = storage.getAccessToken();
      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const businessId = user.id || user.businessId;

      const response = await graphqlRequest<{ createRepairSession: any }>(
        CREATE_REPAIR_SESSION_MUTATION,
        {
          input: {
            customerRequest: formData.customerRequest,
            problemDescription: formData.problemDescription || null,
            priority: formData.priority,
            expectedDeliveryDate: formData.expectedDeliveryDate || null,
            customerNotes: formData.customerNotes || null,
            carId: selectedCarId,
            businessId,
          },
        },
        token
      );

      if (response.data?.createRepairSession) {
        setSuccess("Repair session created successfully!");
        setFormData({
          customerRequest: "",
          problemDescription: "",
          priority: "NORMAL",
          expectedDeliveryDate: "",
          customerNotes: "",
        });
        setSelectedClientId("");
        setSelectedCarId("");

        // Redirect to repair sessions list after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/repair-sessions");
        }, 2000);
      } else if (response.errors) {
        setError(response.errors[0]?.message || "Failed to create repair session");
      }
    } catch (err) {
      console.error("Error creating repair session:", err);
      setError("Failed to create repair session");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleBack = () => {
    router.back();
  };

  if (!user) return null;

  if (loading) {
    return (
      <DashboardLayout
        userName={user?.firstName || "User"}
        userRole={user?.role || "BUSINESS"}
        userType={user?.userType || "BUSINESS"}
        onLogout={handleLogout}
        title="Create Repair Session"
        subtitle="Loading..."
      >
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Loading form data...</p>
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium mb-1">Error loading data:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={user?.firstName || "User"}
      userRole={user?.role || "BUSINESS"}
      userType={user?.userType || "BUSINESS"}
      onLogout={handleLogout}
      title="Create Repair Session"
      subtitle="Register a new repair and maintenance session"
    >
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          ← Back to Sessions
        </button>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Debug Info */}
        {clients.length === 0 && !loading && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="font-medium mb-1"> No clients found</p>
            <p className="text-sm">Please create clients first before creating repair sessions.</p>
            <button
              onClick={() => router.push("/dashboard/clients")}
              className="mt-2 px-4 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              Go to Clients
            </button>
          </div>
        )}

        {clients.length > 0 && cars.length === 0 && !loading && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="font-medium mb-1"> No vehicles found</p>
            <p className="text-sm">Please add vehicles to your clients before creating repair sessions.</p>
          </div>
        )}

        {/* Show loaded counts for debugging */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
           Loaded: {clients.length} client{clients.length !== 1 ? 's' : ''}, {cars.length} vehicle{cars.length !== 1 ? 's' : ''}
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCarId}
                  onChange={(e) => handleCarChange(e.target.value)}
                  disabled={!selectedClientId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  required
                >
                  <option value="">
                    {selectedClientId ? "Select a vehicle..." : "Select a client first"}
                  </option>
                  {getAvailableCars().map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.make} {car.model} ({car.licensePlate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority and Expected Delivery Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0) + priority.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedDeliveryDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Customer Request */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Request <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerRequest}
                onChange={(e) =>
                  setFormData({ ...formData, customerRequest: e.target.value })
                }
                placeholder="e.g., Regular maintenance, Repair engine, Replace battery..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description
              </label>
              <textarea
                value={formData.problemDescription}
                onChange={(e) =>
                  setFormData({ ...formData, problemDescription: e.target.value })
                }
                placeholder="Describe the problem in detail..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Customer Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Notes
              </label>
              <textarea
                value={formData.customerNotes}
                onChange={(e) =>
                  setFormData({ ...formData, customerNotes: e.target.value })
                }
                placeholder="Any additional notes from the customer..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-400"
              >
                {submitting ? "Creating..." : "Create Repair Session"}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How to create a session:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Select a client from your client list</li>
            <li>✓ Choose a vehicle registered to that client</li>
            <li>✓ Enter the customer request and priority level</li>
            <li>✓ Optionally add a problem description and customer notes</li>
            <li>✓ Click "Create Repair Session" to register the session</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
