"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { clientService, Client } from "../../../../services/client/api";
import { sessionService, Session } from "../../../../services/session/api";
import { formatDate } from "../../../../lib/utils";
import { ClientInfoCard } from "../../../../components/client/ClientInfoCard";
import { SessionHistoryCard } from "../../../../components/client/SessionHistoryCard";
import { FeedbackNotification } from "../../../../components/ui/FeedbackNotification";
import { SessionForm } from "../../../../components/session/SessionForm";
import { useSessionCreation } from "../../../../hooks/useSessionCreation";

export default function ClientDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const clientId = id as string;

  // State for client data and loading
  const [client, setClient] = useState<Client | null>(null);
  const [clientSessions, setClientSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use custom hook for session creation logic
  const {
    isCreatingSession,
    sessionFeedback,
    showSessionForm,
    handleCreateServiceSession,
    clearFeedback,
    toggleSessionForm,
    closeSessionForm,
  } = useSessionCreation(client);

  // Fetch client data and sessions
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

  // Get primary vehicle
  const getPrimaryVehicle = () => {
    if (client?.cars && client.cars.length > 0) {
      return client.cars[0];
    }
    return null;
  };

  const primaryVehicle = client ? getPrimaryVehicle() : null;
  const lastVisitDate =
    clientSessions.length > 0 ? formatDate(clientSessions[0].createdAt) : null;

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
        <FeedbackNotification
          message={sessionFeedback.message}
          type={sessionFeedback.type}
          onDismiss={clearFeedback}
        />
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
        <ClientInfoCard
          client={client}
          primaryVehicle={primaryVehicle}
          onNewSession={handleCreateServiceSession}
          isCreatingSession={isCreatingSession}
          lastVisitDate={lastVisitDate}
        />

        {/* Session History Card */}
        <SessionHistoryCard
          sessions={clientSessions}
          onNewSession={handleCreateServiceSession}
          isCreatingSession={isCreatingSession}
        />
      </div>

      {/* Session creation form modal */}
      {showSessionForm && (
        <SessionForm
          onClose={closeSessionForm}
          onSubmit={handleCreateServiceSession}
          isSubmitting={isCreatingSession}
        />
      )}
    </div>
  );
}
