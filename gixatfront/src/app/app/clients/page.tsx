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
      (client.mobileNumber &&
        client.mobileNumber.toLowerCase().includes(searchLower)) ||
      (client.plateNumber &&
        client.plateNumber.toLowerCase().includes(searchLower)) ||
      (client.vehicles &&
        client.vehicles.length > 0 &&
        client.vehicles[0].model &&
        client.vehicles[0].model.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-4 md:space-y-6 px-1 md:px-0 pb-16 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <h1 className="text-xl md:text-2xl font-bold">Clients</h1>
        <Link href="/app/clients/new">
          <button className="w-full md:w-auto px-4 py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-700 rounded-md">
            Add New Client
          </button>
        </Link>
      </div>

      {/* Search and filter */}
      <div className="flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-3 py-1.5 md:px-4 md:py-2">
        <svg
          className="h-4 w-4 md:h-5 md:w-5 text-gray-400"
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
          placeholder="Search clients..."
          className="bg-transparent border-none w-full ml-2 text-sm md:text-base focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 md:h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-3 md:mt-4 text-sm md:text-base">
              Loading clients...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-6 md:py-8 text-red-400 text-sm md:text-base">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 md:mt-4 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Try Again
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-6 md:py-8 text-gray-400 text-sm md:text-base">
          {searchTerm ? (
            <p>No clients found matching your search.</p>
          ) : (
            <>
              <p>No clients have been added yet.</p>
              <Link href="/app/clients/new">
                <button className="mt-3 md:mt-4 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-700 rounded-md">
                  Add Your First Client
                </button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {filteredClients.map((client) => {
            const primaryVehicle =
              client.vehicles && client.vehicles.length > 0
                ? client.vehicles[0]
                : null;

            return (
              <Link key={client.id} href={`/app/clients/${client.id}`}>
                <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/30 hover:bg-gray-700/70 rounded-xl p-3.5 md:p-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/10">
                  <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
                    {/* Client Info */}
                    <div className="flex items-start gap-3">
                      <div>
                        <h3 className="font-medium text-base md:text-lg text-white">
                          {client.name}
                        </h3>
                        <p className="text-gray-400 text-xs md:text-sm">
                          {client.mobileNumber ||
                            (client.phone && `${client.phone}`)}
                        </p>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {primaryVehicle && (
                        <div className="flex items-center gap-1.5">
                          <div className="text-blue-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 md:h-4.5 md:w-4.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                              <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                              <path d="M5 9l2 -4h8l1 4" />
                              <path d="M5 9h12a1 1 0 0 1 1 1v4.5a1.5 1.5 0 0 1 -1.5 1.5h-12.5" />
                            </svg>
                          </div>
                          <span className="text-sm md:text-base text-gray-200">
                            {primaryVehicle.make && primaryVehicle.model
                              ? `${primaryVehicle.make} ${
                                  primaryVehicle.model
                                } ${primaryVehicle.year || ""}`
                              : client.carModel}
                          </span>
                        </div>
                      )}

                      {(primaryVehicle?.plateNumber || client.plateNumber) && (
                        <div className="flex items-center gap-1.5">
                          <div className="text-blue-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 md:h-4.5 md:w-4.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
                              <path d="M7 9h10" />
                              <path d="M9 17v-8" />
                              <path d="M15 17v-8" />
                            </svg>
                          </div>
                          <span className="text-sm md:text-base text-gray-200">
                            {primaryVehicle?.plateNumber || client.plateNumber}
                          </span>
                        </div>
                      )}

                      {client.lastVisit && (
                        <div className="flex items-center gap-1.5">
                          <div className="text-blue-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 md:h-4.5 md:w-4.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
                              <path d="M16 3l0 4" />
                              <path d="M8 3l0 4" />
                              <path d="M4 11l16 0" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-1 text-sm md:text-base text-gray-200">
                            <span>
                              {new Date(client.lastVisit).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* For clients with no last visit, show created date instead */}
                      {!client.lastVisit && client.createdAt && (
                        <div className="flex items-center gap-1.5">
                          <div className="text-blue-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 md:h-4.5 md:w-4.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
                              <path d="M16 3l0 4" />
                              <path d="M8 3l0 4" />
                              <path d="M4 11l16 0" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-1 text-sm md:text-base text-gray-200">
                            <span>
                              Added:{" "}
                              {new Date(client.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
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
