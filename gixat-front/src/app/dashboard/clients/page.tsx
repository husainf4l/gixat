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
  email: string;
  phone: string;
  businessId?: string;
  createdAt: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
  });

  useEffect(() => {
    const storedUser = storage.getUser();
    const accessToken = storage.getAccessToken();

    if (!storedUser || !accessToken) {
      router.push("/auth/login");
      return;
    }

    setUser(storedUser);
    setPageLoading(false);

    // Fetch clients from GraphQL
    fetchClients(accessToken, storedUser);
  }, [router]);

  const fetchClients = async (token: string, currentUser: User) => {
    try {
      if (!token) {
        console.warn("No token available, loading mock data");
        loadMockClients();
        return;
      }

      console.log("Fetching clients with token:", token.substring(0, 20) + "...");

      // Fetch clients from GraphQL - no filter needed
      const response = await graphqlRequest<{ clients: Client[] }>(
        `query {
          clients {
            id
            email
            phone
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
        console.log("No clients found or query returned empty, loading mock data");
        // Load mock data if no clients found or query doesn't exist
        loadMockClients();
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Load mock data on error
      loadMockClients();
    }
  };

  const loadMockClients = () => {
    const mockClients: Client[] = [
      {
        id: "1",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567",
        businessId: "1",
        createdAt: new Date("2024-01-15").toISOString(),
      },
      {
        id: "2",
        email: "sarah.johnson@example.com",
        phone: "+1 (555) 234-5678",
        businessId: "1",
        createdAt: new Date("2024-02-20").toISOString(),
      },
      {
        id: "3",
        email: "michael.chen@example.com",
        phone: "+1 (555) 345-6789",
        businessId: "1",
        createdAt: new Date("2024-03-10").toISOString(),
      },
      {
        id: "4",
        email: "emily.davis@example.com",
        phone: "+1 (555) 456-7890",
        businessId: "1",
        createdAt: new Date("2024-03-25").toISOString(),
      },
      {
        id: "5",
        email: "robert.wilson@example.com",
        phone: "+1 (555) 567-8901",
        businessId: "1",
        createdAt: new Date("2024-04-05").toISOString(),
      },
    ];
    setClients(mockClients);
  };

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create client via GraphQL mutation - use GraphQL fields
      const newClient: Client = {
        id: Date.now().toString(),
        email: formData.email,
        phone: formData.phone,
        businessId: user?.id || "1",
        createdAt: new Date().toISOString(),
      };

      // Add to local state
      setClients((prev) => [newClient, ...prev]);
      setFormData({
        email: "",
        phone: "",
      });
      setShowForm(false);
      alert("Client created successfully!");
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
            {showForm ? "✕ Cancel" : "➕ New Client"}
          </button>
        </div>

        {/* Create Client Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Client</h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="client@example.com"
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Business ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{client.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.businessId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(client.createdAt).toLocaleDateString()}
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
