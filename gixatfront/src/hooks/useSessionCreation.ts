import { useState } from "react";
import { useRouter } from "next/navigation";
import { Client } from "../services/client/api";
import { sessionService, SessionStatus } from "../services/session/api";

export interface SessionFeedback {
  message: string;
  type: "success" | "error";
}

export function useSessionCreation(client: Client | null) {
  const router = useRouter();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedback | null>(null);
  const [showSessionForm, setShowSessionForm] = useState(false);

  const handleCreateServiceSession = async () => {
    // Don't proceed if already creating a session or if client is null
    if (isCreatingSession || !client) return;

    // Check if client has a vehicle in the cars array
    const hasVehicles =
      client.cars && Array.isArray(client.cars) && client.cars.length > 0;

    if (!hasVehicles) {
      setSessionFeedback({
        message: "Cannot create session - no vehicle associated with this client",
        type: "error",
      });
      setTimeout(() => setSessionFeedback(null), 5000); // Clear after 5 seconds
      return;
    }

    // Skip showing the form and proceed directly with session creation
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

      // Navigate directly to the entry page for this session
      router.push(`/app/sessions/entry/${sessionData.id}`);
      
      return sessionData;
    } catch (error) {
      console.error("Error creating service session:", error);
      setSessionFeedback({
        message: "Failed to create service session. Please try again.",
        type: "error",
      });
      return null;
    } finally {
      setIsCreatingSession(false);
      setTimeout(() => setSessionFeedback(null), 5000); // Clear after 5 seconds
    }
  };

  const clearFeedback = () => setSessionFeedback(null);
  const toggleSessionForm = () => setShowSessionForm(!showSessionForm);
  const closeSessionForm = () => setShowSessionForm(false);

  return {
    isCreatingSession,
    sessionFeedback,
    showSessionForm,
    handleCreateServiceSession,
    clearFeedback,
    toggleSessionForm,
    closeSessionForm
  };
}