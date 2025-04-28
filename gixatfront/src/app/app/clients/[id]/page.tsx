"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { clientService, Client } from "../../../../services/client/api";
import {
  sessionService,
  Session,
  SessionStatus,
} from "../../../../services/session/api";

export default function ClientDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const clientId = id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [clientSessions, setClientSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Fetch client data from service
        const clientData = await clientService.getClientById(clientId);
        setClient(clientData);

        // Fetch client sessions from service
        try {
          const sessions = await sessionService.getSessionsByCustomer(clientId);
          setClientSessions(sessions);
        } catch (sessionErr) {
          console.error("Failed to fetch client sessions:", sessionErr);
        }

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

  // Create a new service session for this client
  const handleCreateServiceSession = async () => {
    // Don't proceed if already creating a session or if client is null
    if (isCreatingSession || !client) return;

    // Check if client has a vehicle in the cars array
    const hasVehicles =
      client.cars && Array.isArray(client.cars) && client.cars.length > 0;

    if (!hasVehicles) {
      setSessionFeedback({
        message:
          "Cannot create session - no vehicle associated with this client",
        type: "error",
      });
      setTimeout(() => setSessionFeedback(null), 5000); // Clear after 5 seconds
      return;
    }

    setIsCreatingSession(true);
    try {
      // Use the garage ID from the client object
      const garageId = client.garageId || "default-garage-id";

      // Get vehicle ID from the cars array (we already checked cars exists above)
      const vehicleId = client.cars[0].id;

      const sessionData = await sessionService.createSession({
        customerId: client.id,
        carId: vehicleId,
        garageId: garageId,
        status: SessionStatus.OPEN,
      });

      setSessionFeedback({
        message: "Service session created successfully!",
        type: "success",
      });

      // Add the new session to the sessions list
      setClientSessions((prevSessions) => [sessionData, ...prevSessions]);

      // Optionally navigate to a session detail page
      // router.push(`/app/sessions/${sessionData.id}`);
    } catch (error) {
      console.error("Error creating service session:", error);
      setSessionFeedback({
        message: "Failed to create service session. Please try again.",
        type: "error",
      });
    } finally {
      setIsCreatingSession(false);
      setTimeout(() => setSessionFeedback(null), 5000); // Clear after 5 seconds
    }
  };

  // Get the primary vehicle details - only use cars array
  const getPrimaryVehicle = () => {
    if (client?.cars && client.cars.length > 0) {
      return client.cars[0];
    }
    return null;
  };

  const primaryVehicle = client ? getPrimaryVehicle() : null;

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 md:h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-3 md:mt-4 text-sm md:text-base">
            Loading client data...
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
          Client Not Found
        </h1>
        <p className="mb-4 md:mb-6 text-sm md:text-base text-center">
          {error ||
            "The client you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/app/clients">
          <button className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-700 rounded-md">
            Return to Clients List
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8 px-1 md:px-0 pb-16 md:pb-6">
      {/* Feedback notification */}
      {sessionFeedback && (
        <div
          className={`fixed right-4 top-20 max-w-sm p-4 rounded-lg shadow-lg z-50 border transition-opacity duration-300 ${
            sessionFeedback.type === "success"
              ? "bg-green-800/90 border-green-600"
              : "bg-red-800/90 border-red-600"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {sessionFeedback.type === "success" ? (
                <svg
                  className="w-5 h-5 text-green-300"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-300"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  sessionFeedback.type === "success"
                    ? "text-green-200"
                    : "text-red-200"
                }`}
              >
                {sessionFeedback.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setSessionFeedback(null)}
                  className={`inline-flex p-1.5 rounded-md focus:outline-none ${
                    sessionFeedback.type === "success"
                      ? "text-green-300 hover:bg-green-700"
                      : "text-red-300 hover:bg-red-700"
                  }`}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white text-sm md:text-base group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5 mr-1 group-hover:-translate-x-0.5 transition-transform"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Client Information Card */}
        <div className="lg:col-span-1 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-500/20 rounded-full h-14 w-14 md:h-16 md:w-16 flex items-center justify-center text-blue-400 shrink-0">
              <span className="text-xl md:text-2xl font-semibold">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">
                {client.name}
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                {client.mobileNumber}
              </p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-5">
            {/* Vehicle details with icons */}
            {(primaryVehicle || client.carModel || client.plateNumber) && (
              <div className="border-t border-gray-700/50 pt-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Vehicle Details
                </h3>
                <div className="space-y-2.5">
                  {(primaryVehicle?.model || client.carModel) && (
                    <div className="flex items-center gap-2.5">
                      <div className="text-blue-400 bg-blue-500/10 p-1.5 rounded-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4.5 w-4.5 md:h-5 md:w-5"
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
                      <div>
                        <div className="text-xs text-gray-400">Car Model</div>
                        <div className="text-base md:text-lg text-white">
                          {primaryVehicle?.model || client.carModel}
                        </div>
                      </div>
                    </div>
                  )}

                  {(primaryVehicle?.plateNumber || client.plateNumber) && (
                    <div className="flex items-center gap-2.5">
                      <div className="text-blue-400 bg-blue-500/10 p-1.5 rounded-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4.5 w-4.5 md:h-5 md:w-5"
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
                      <div>
                        <div className="text-xs text-gray-400">
                          Plate Number
                        </div>
                        <div className="text-base md:text-lg text-white">
                          {primaryVehicle?.plateNumber || client.plateNumber}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Last Visit */}
            <div className="border-t border-gray-700/50 pt-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Visit Information
              </h3>
              <div className="flex items-center gap-2.5">
                <div className="text-blue-400 bg-blue-500/10 p-1.5 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4.5 w-4.5 md:h-5 md:w-5"
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
                <div>
                  <div className="text-xs text-gray-400">Last Visit</div>
                  <div className="text-base md:text-lg text-white">
                    {clientSessions.length > 0
                      ? formatDate(clientSessions[0].createdAt)
                      : "No visits yet"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-8 pt-4 border-t border-gray-700/50 flex flex-col md:flex-row gap-2 md:gap-3">
            <button className="w-full md:w-auto px-3 py-1.5 md:px-4 md:py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4h-7a2 2 0 0 0 -2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2 -2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3l-11 11h-3v-3l11 -11z" />
              </svg>
              Edit Client
            </button>
            <button
              onClick={handleCreateServiceSession}
              disabled={isCreatingSession}
              className={`w-full md:w-auto px-3 py-1.5 md:px-4 md:py-2 text-sm bg-green-600 hover:bg-green-500 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isCreatingSession ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isCreatingSession ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                    <path d="M12 8l0 8" />
                    <path d="M8 12l8 0" />
                  </svg>
                  New Session
                </>
              )}
            </button>
          </div>
        </div>

        {/* Session History Card - Replacing Service History */}
        <div className="lg:col-span-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 mb-4 md:mb-6 border-b border-gray-700/50 pb-4">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77 -3.77a6 6 0 0 1 -7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1 -3 -3l6.91 -6.91a6 6 0 0 1 7.94 -7.94l-3.76 3.76z" />
              </svg>
              <h2 className="text-lg md:text-xl font-bold">Session History</h2>
            </div>
            <button
              onClick={handleCreateServiceSession}
              disabled={isCreatingSession}
              className={`w-full md:w-auto px-3 py-1.5 md:px-3 md:py-1.5 bg-blue-600 hover:bg-blue-500 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isCreatingSession ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isCreatingSession ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                    <path d="M12 8l0 8" />
                    <path d="M8 12l8 0" />
                  </svg>
                  New Session
                </>
              )}
            </button>
          </div>

          {clientSessions.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {clientSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-700/70 border border-gray-600/30 p-3.5 md:p-4 rounded-lg hover:bg-gray-700/90 transition-colors cursor-pointer"
                  onClick={() => router.push(`/app/sessions/${session.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <div className="bg-blue-500/20 p-1.5 rounded text-blue-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77 -3.77a6 6 0 0 1 -7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1 -3 -3l6.91 -6.91a6 6 0 0 1 7.94 -7.94l-3.76 3.76z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-sm md:text-base text-white">
                        Service Session
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs md:text-sm text-gray-300 flex items-center gap-1 justify-end">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 text-gray-400"
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
                        <span>{formatDate(session.createdAt)}</span>
                      </div>
                      <div className="font-medium text-sm md:text-base">
                        <span
                          className={`
                          ${
                            session.status === SessionStatus.OPEN
                              ? "text-yellow-400"
                              : ""
                          }
                          ${
                            session.status === SessionStatus.IN_PROGRESS
                              ? "text-blue-400"
                              : ""
                          }
                          ${
                            session.status === SessionStatus.COMPLETED
                              ? "text-green-400"
                              : ""
                          }
                          ${
                            session.status === SessionStatus.CLOSED
                              ? "text-red-400"
                              : ""
                          }
                        `}
                        >
                          {session.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {session.car && (
                      <div className="px-2 py-0.5 bg-gray-600/40 rounded-md text-xs text-gray-300 flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
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
                        {session.car.make} {session.car.model}
                      </div>
                    )}
                    {session.car && session.car.plateNumber && (
                      <div className="px-2 py-0.5 bg-gray-600/40 rounded-md text-xs text-gray-300 flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
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
                        {session.car.plateNumber}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 text-gray-400 text-sm md:text-base bg-gray-700/20 rounded-lg border border-dashed border-gray-600/50">
              <div className="flex justify-center mb-3">
                <div className="bg-gray-700/50 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77 -3.77a6 6 0 0 1 -7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1 -3 -3l6.91 -6.91a6 6 0 0 1 7.94 -7.94l-3.76 3.76z" />
                  </svg>
                </div>
              </div>
              <p>No session history available for this client.</p>
              <button
                onClick={handleCreateServiceSession}
                disabled={isCreatingSession}
                className={`mt-3 md:mt-4 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-500 rounded-lg inline-flex items-center gap-2 transition-colors ${
                  isCreatingSession ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isCreatingSession ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                      <path d="M12 8l0 8" />
                      <path d="M8 12l8 0" />
                    </svg>
                    Add First Session
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
