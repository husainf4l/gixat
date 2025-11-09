"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import DashboardLayout from "@/components/DashboardLayout";
import ClientDetails from "@/components/ClientDetails";
import { User } from "@/lib/auth.types";

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

export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
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
      setPageLoading(false);
      fetchClient(accessToken);
    }
  }, [router, isInitialized]);

  const checkGarageAndFetch = async (token: string, currentUser: User) => {
    try {
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
        router.push("/setup-garage");
        return;
      }

      setUser(currentUser);
      setPageLoading(false);
      fetchClient(token);
    } catch (error) {
      console.error("Error checking garage:", error);
      router.push("/setup-garage");
    }
  };

  const fetchClient = async (token: string) => {
    try {
      const response = await graphqlRequest<{ client: Client }>(
        `query($id: ID!) {
          client(id: $id) {
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
        { id: clientId },
        token
      );

      if (response.data?.client) {
        setClient(response.data.client);
      } else {
        console.error("Client not found");
      }
    } catch (error) {
      console.error("Error fetching client:", error);
    }
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

  if (!client) {
    return (
      <DashboardLayout
        userRole="owner"
        userType={user.type}
        userName={user.name}
        onLogout={handleLogout}
        title="Client Details"
        subtitle="Loading client information..."
      >
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Client not found</p>
          <button
            onClick={() => router.push("/dashboard/clients")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Clients
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="owner"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title={`${client.firstName} ${client.lastName}`}
      subtitle="Client Profile & Vehicles"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center gap-2"
        >
          ← Back to Clients
        </button>

        {/* Client Details Component */}
        <ClientDetails
          clientId={client.id}
          clientName={`${client.firstName} ${client.lastName}`}
          clientEmail={client.email}
          clientPhone={client.phone}
          onClose={() => router.push("/dashboard/clients")}
        />
      </div>
    </DashboardLayout>
  );
}
