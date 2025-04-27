"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { clientService, Client } from "../../../services/client/api";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const data = await clientService.getClients();
        setClients(data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch clients:", err);
        setError("Failed to load clients. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filter clients based on search term
  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      (client.plateNumber &&
        client.plateNumber.toLowerCase().includes(searchLower)) ||
      (client.carModel && client.carModel.toLowerCase().includes(searchLower))
    );
  });

  // Function to calculate days since last visit
  const calculateDaysSinceVisit = (lastVisitDate: string | null) => {
    if (!lastVisitDate) return null;

    const today = new Date();
    const lastVisit = new Date(lastVisitDate);
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/app/clients/new">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
            Add New Client
          </button>
        </Link>
      </div>

      {/* Search and filter */}
      <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search clients by name, car model, or plate number..."
          className="bg-transparent border-none w-full ml-2 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Loading clients...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-400">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Try Again
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {searchTerm ? (
            <p>No clients found matching your search.</p>
          ) : (
            <>
              <p>No clients have been added yet.</p>
              <Link href="/app/clients/new">
                <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
                  Add Your First Client
                </button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredClients.map((client) => {
            const daysSinceVisit = calculateDaysSinceVisit(client.lastVisit);
            const primaryVehicle =
              client.vehicles && client.vehicles.length > 0
                ? client.vehicles[0]
                : null;

            return (
              <Link key={client.id} href={`/app/clients/${client.id}`}>
                <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 sm:col-span-4 md:col-span-3">
                      <h3 className="font-medium text-lg truncate">
                        {client.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {client.mobileNumber}
                      </p>
                    </div>

                    <div className="col-span-12 sm:col-span-4 md:col-span-3">
                      <div className="text-sm text-gray-400">Car Model</div>
                      <div className="truncate">
                        {primaryVehicle?.model || client.carModel || "N/A"}
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-2 md:col-span-2">
                      <div className="text-sm text-gray-400">Plate</div>
                      <div>
                        {primaryVehicle?.licensePlate ||
                          client.plateNumber ||
                          "N/A"}
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-2 md:col-span-2">
                      <div className="text-sm text-gray-400">Last Visit</div>
                      <div className="flex items-center gap-2">
                        {client.lastVisit ? (
                          <>
                            <span>
                              {new Date(client.lastVisit).toLocaleDateString()}
                            </span>
                            {daysSinceVisit && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  daysSinceVisit > 30
                                    ? "bg-red-900 text-red-200"
                                    : daysSinceVisit > 14
                                    ? "bg-yellow-900 text-yellow-200"
                                    : "bg-green-900 text-green-200"
                                }`}
                              >
                                {daysSinceVisit}d
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-2 flex justify-start md:justify-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.status === "ACTIVE"
                            ? "bg-green-900 text-green-200"
                            : client.status === "INACTIVE"
                            ? "bg-red-900 text-red-200"
                            : "bg-yellow-900 text-yellow-200"
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
