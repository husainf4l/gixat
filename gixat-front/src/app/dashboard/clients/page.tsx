"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { User } from "@/lib/auth.types";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";

interface Client {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: string;
  notes?: string;
  businessId?: string;
  createdAt: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [businessId, setBusinessId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
    notes: "",
  });

  // Declare functions BEFORE useEffect to avoid temporal dead zone
  const fetchClients = async (token: string, currentUser: User) => {
    try {
      if (!token) {
        console.warn("No token available");
        return;
      }

      console.log("Fetching clients with token:", token.substring(0, 20) + "...");

      // Fetch clients from GraphQL - no filter needed
      const response = await graphqlRequest<{ clients: Client[] }>(
        `query {
          clients {
            id
            firstName
            lastName
            email
            phone
            address
            city
            state
            zipCode
            dateOfBirth
            notes
            businessId
            createdAt
          }
        }`,
        {},
        token
      );

      if (response.data?.clients && response.data.clients.length > 0) {
        console.log("Successfully fetched clients:", response.data.clients.length);
        setClients(response.data.clients);
      } else {
        console.log("No clients found");
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    }
  };

  const checkGarageAndFetch = async (token: string, currentUser: User) => {
    try {
      // Check if user has a garage
      const garageResponse = await graphqlRequest<{ 
        myGarages: Array<{ id: string }> 
      }>(
        `query {
          myGarages {
            id
          }
        }`,
        {},
        token
      );

      if (!garageResponse.data?.myGarages || garageResponse.data.myGarages.length === 0) {
        // No garage, redirect to setup
        router.push("/setup-garage");
        return;
      }

      // Has garage, proceed
      setUser(currentUser);
      setBusinessId(currentUser.id || "1");
      setPageLoading(false);
      fetchClients(token, currentUser);
    } catch (error) {
      console.error("Error checking garage:", error);
      // If error checking garage, redirect to setup
      router.push("/setup-garage");
    }
  };

  useEffect(() => {
    // Only run once on component mount
    if (isInitialized) return;

    const storedUser = storage.getUser();
    const accessToken = storage.getAccessToken();

    if (!storedUser || !accessToken) {
      router.push("/auth/login");
      return;
    }

    setIsInitialized(true);

    // Check if BUSINESS user has garage set up
    if (storedUser.type === "BUSINESS") {
      checkGarageAndFetch(accessToken, storedUser);
    } else {
      setUser(storedUser);
      setBusinessId(storedUser.id || "1");
      setPageLoading(false);
      fetchClients(accessToken, storedUser);
    }
  }, [router, isInitialized]);

  const loadMockClients = () => {
    // Mock data removed - only using GraphQL queries
    setClients([]);
  };

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = storage.getAccessToken();
      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      if (!businessId) {
        alert("Business ID not found. Please refresh and try again.");
        return;
      }

      // Create client via GraphQL mutation
      const response = await graphqlRequest<{ createClient: Client }>(
        `mutation($input: CreateClientInput!) {
          createClient(input: $input) {
            id
            firstName
            lastName
            email
            phone
            address
            city
            state
            zipCode
            dateOfBirth
            notes
            businessId
            createdAt
          }
        }`,
        {
          input: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zipCode: formData.zipCode || null,
            dateOfBirth: formData.dateOfBirth || null,
            notes: formData.notes || null,
            businessId: businessId,
          },
        },
        token
      );

      if (response.data?.createClient) {
        const newClient = response.data.createClient;
        setClients((prev) => [newClient, ...prev]);
        alert("Client created successfully!");
      } else if (response.errors) {
        console.error("Error creating client:", response.errors);
        alert(`Error: ${response.errors[0]?.message || "Failed to create client"}`);
      }
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        dateOfBirth: "",
        notes: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Error creating client. Please try again.");
    }
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
      title="Clients"
      subtitle="Manage your clients"
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-2">
              {clients.length > 0 ? `${clients.length} client(s)` : "Manage your clients and their information"}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {showForm ? "Cancel" : "New Client"}
          </button>
        </div>

        {/* Create Client Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Client</h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="John"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Smith"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Save Client
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients List */}
        {clients.length === 0 && !showForm ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <EmptyState
              icon="👥"
              title="No Clients Found"
              description="No clients have been added yet. Click 'New Client' to create your first client."
              buttonLabel="Create First Client"
              onButtonClick={() => setShowForm(true)}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">City</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date of Birth</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {client.firstName} {client.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.city || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
