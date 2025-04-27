"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  clientService,
  Client,
  ServiceRecord,
} from "../../../../services/client/api";

export default function ClientDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const clientId = id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        const clientData = await clientService.getClientById(clientId);
        setClient(clientData);

        // Also fetch the service history
        const serviceData = await clientService.getClientServiceHistory(
          clientId
        );
        setServiceHistory(serviceData);

        setError("");
      } catch (err) {
        console.error("Failed to fetch client data:", err);
        setError("Failed to load client data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  // Function to calculate days since last visit
  const calculateDaysSinceVisit = (lastVisitDate: string | null) => {
    if (!lastVisitDate) return null;

    const today = new Date();
    const lastVisit = new Date(lastVisitDate);
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading client data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
        <p className="mb-6">
          {error ||
            "The client you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/app/clients">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
            Return to Clients List
          </button>
        </Link>
      </div>
    );
  }

  const daysSinceVisit = calculateDaysSinceVisit(client.lastVisit);

  // Get the first vehicle details if available
  const primaryVehicle =
    client.vehicles && client.vehicles.length > 0 ? client.vehicles[0] : null;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Clients
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Client Information Card */}
        <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">
            Client Information
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Client Name</h3>
              <p className="text-lg">{client.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Mobile Number
              </h3>
              <p className="text-lg">{client.mobileNumber}</p>
            </div>

            {primaryVehicle && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">
                    Car Model
                  </h3>
                  <p className="text-lg">{primaryVehicle.model}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400">
                    Plate Number
                  </h3>
                  <p className="text-lg">{primaryVehicle.licensePlate}</p>
                </div>
              </>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-400">Last Visit</h3>
              {client.lastVisit ? (
                <div className="flex items-center gap-2">
                  <p className="text-lg">
                    {new Date(client.lastVisit).toLocaleDateString()}
                  </p>
                  {daysSinceVisit && (
                    <span
                      className={`text-sm px-2 py-0.5 rounded-full ${
                        daysSinceVisit > 30
                          ? "bg-red-900 text-red-200"
                          : daysSinceVisit > 14
                          ? "bg-yellow-900 text-yellow-200"
                          : "bg-green-900 text-green-200"
                      }`}
                    >
                      {daysSinceVisit} days ago
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-lg text-gray-400">No previous visits</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400">Status</h3>
              <p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    client.status === "ACTIVE"
                      ? "bg-green-900 text-green-200"
                      : client.status === "INACTIVE"
                      ? "bg-red-900 text-red-200"
                      : "bg-yellow-900 text-yellow-200"
                  }`}
                >
                  {client.status}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
              Edit Client
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md">
              New Service
            </button>
          </div>
        </div>

        {/* Service History Card */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-bold">Service History</h2>
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm rounded-md">
              Add Service Record
            </button>
          </div>

          {serviceHistory.length > 0 ? (
            <div className="space-y-4">
              {serviceHistory.map((service) => (
                <div key={service.id} className="bg-gray-700 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{service.serviceType}</h3>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">
                        {new Date(service.date).toLocaleDateString()}
                      </div>
                      <div className="font-medium text-green-400">
                        ${service.cost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">{service.description}</p>
                  <div className="text-sm text-gray-400">
                    Technician: {service.technicianName}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No service history available for this client.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
                Add First Service
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
