"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  sessionService,
  Session,
  SessionStatus,
  SessionEntryData,
  Customer,
} from "../../../../services/session/api";
import SessionEntries from "../../../../components/session/SessionEntries";
import SessionEntryForm from "../../../../components/session/SessionEntryForm";

export default function SessionDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const sessionId = id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Session entries state from API response
  const [sessionEntries, setSessionEntries] = useState<SessionEntryData[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true);
      try {
        const sessionData = await sessionService.getSessionById(sessionId);
        setSession(sessionData);

        // Set entries from the session response if available
        if (sessionData.entries && Array.isArray(sessionData.entries)) {
          setSessionEntries(sessionData.entries);
        }

        setError("");
      } catch (err) {
        console.error("Failed to fetch session data:", err);
        setError("Failed to load session data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  // Function to fetch session entries (can be used for refreshing entries)
  const fetchSessionEntries = async () => {
    setEntriesLoading(true);
    try {
      const sessionData = await sessionService.getSessionById(sessionId);
      if (sessionData.entries && Array.isArray(sessionData.entries)) {
        setSessionEntries(sessionData.entries);
      }
    } catch (err) {
      console.error("Error fetching session entries:", err);
    } finally {
      setEntriesLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle session status update
  const handleStatusUpdate = async (newStatus: SessionStatus) => {
    if (statusUpdateLoading || !session) return;

    setStatusUpdateLoading(true);
    try {
      const updatedSession = await sessionService.updateSessionStatus(
        sessionId,
        newStatus
      );
      setSession(updatedSession);
      setStatusFeedback({
        message: `Session status updated to ${newStatus} successfully`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating session status:", error);
      setStatusFeedback({
        message: "Failed to update session status. Please try again.",
        type: "error",
      });
    } finally {
      setStatusUpdateLoading(false);
      setTimeout(() => setStatusFeedback(null), 5000); // Clear after 5 seconds
    }
  };

  // Get status badge color based on session status
  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.OPEN:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case SessionStatus.IN_PROGRESS:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case SessionStatus.WAITING_FOR_APPROVAL:
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case SessionStatus.APPROVED:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case SessionStatus.REJECTED:
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case SessionStatus.COMPLETED:
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case SessionStatus.CLOSED:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Get next status options based on current status
  const getNextStatusOptions = (currentStatus: SessionStatus) => {
    // Show all possible statuses
    return [
      SessionStatus.OPEN,
      SessionStatus.IN_PROGRESS,
      SessionStatus.WAITING_FOR_APPROVAL,
      SessionStatus.APPROVED,
      SessionStatus.REJECTED,
      SessionStatus.COMPLETED,
      SessionStatus.CLOSED,
    ];
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle error state
  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
          Session Not Found
        </h1>
        <p className="mb-4 md:mb-6 text-sm md:text-base text-center">
          {error ||
            "The session you're looking for doesn't exist or has been removed."}
        </p>
        <Link href="/app/sessions">
          <button className="px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-700 rounded-md">
            Return to Sessions List
          </button>
        </Link>
      </div>
    );
  }

  // Render the main content when we have session data
  return (
    <div className="space-y-4 md:space-y-8 px-1 md:px-0 pb-16 md:pb-6">
      {/* Status update feedback notification */}
      {statusFeedback && (
        <div
          className={`fixed right-4 top-20 max-w-sm p-4 rounded-lg shadow-lg z-50 border transition-opacity duration-300 ${
            statusFeedback.type === "success"
              ? "bg-green-800/90 border-green-600"
              : "bg-red-800/90 border-red-600"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {statusFeedback.type === "success" ? (
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
                  statusFeedback.type === "success"
                    ? "text-green-200"
                    : "text-red-200"
                }`}
              >
                {statusFeedback.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setStatusFeedback(null)}
                  className={`inline-flex p-1.5 rounded-md focus:outline-none ${
                    statusFeedback.type === "success"
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
          Back
        </button>
      </div>

      {/* Session Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm relative z-[101]">
        <div className="flex gap-4 items-start md:items-center">
          <div className="bg-blue-500/20 rounded-md p-3 text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold">Service Session</h1>
              <div
                className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                  session.status
                )}`}
              >
                {session.status}
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
              <div className="text-gray-400 text-sm">
                ID:{" "}
                <span className="text-gray-300 font-mono">
                  {session.id.slice(0, 8)}
                </span>
              </div>
              <div className="text-gray-400 text-sm flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
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
                <span>Created: {formatDate(session.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Update Dropdown */}
        <div className="flex-shrink-0">
          <div className="relative z-[102]" ref={statusDropdownRef}>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium flex items-center gap-2"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              disabled={statusUpdateLoading}
            >
              {statusUpdateLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
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
                    <path d="M12 5l0 14" />
                    <path d="M6 11l12 0" />
                  </svg>
                  Update Status
                </>
              )}
            </button>
            {statusDropdownOpen && (
              <div
                id="status-dropdown"
                className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[103]"
                style={{
                  position: "absolute",
                  marginTop: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div className="py-1">
                  {getNextStatusOptions(session.status).map((status) => (
                    <button
                      key={status}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      onClick={() => {
                        handleStatusUpdate(status);
                        setStatusDropdownOpen(false);
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Client and Vehicle Information */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Client Card */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
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
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <path d="M12 3a4 4 0 0 0 0 8 4 4 0 0 0 0-8z" />
                </svg>
                Client Information
              </h2>
              <Link href={`/app/clients/${session.customerId}`}>
                <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  View
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
                    <path d="M5 12l14 0" />
                    <path d="M13 18l6 -6" />
                    <path d="M13 6l6 6" />
                  </svg>
                </button>
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 rounded-full h-10 w-10 flex items-center justify-center text-blue-400 shrink-0">
                  <span className="text-lg font-semibold">
                    {session.customer?.name
                      ? session.customer.name.charAt(0)
                      : "C"}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">
                    {session.customer?.name || `Client #${session.customerId}`}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {session.customer?.phone || "No phone number provided"}
                  </p>
                </div>
              </div>

              {session.customer && (
                <div className="pt-2 border-t border-gray-700/30">
                  <div className="text-xs text-gray-400 mb-1">Address</div>
                  <div className="text-sm text-gray-300">
                    {session.customer.address || "No address provided"}
                  </div>
                </div>
              )}

              {session.customer?.notes && (
                <div className="pt-2 border-t border-gray-700/30">
                  <div className="text-xs text-gray-400 mb-1">Notes</div>
                  <div className="text-sm text-gray-300">
                    {session.customer.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Card */}
          {session.car && (
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/50">
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
                  <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                  <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                  <path d="M5 9l2 -4h8l1 4" />
                  <path d="M5 9h12a1 1 0 0 1 1 1v4.5a1.5 1.5 0 0 1 -1.5 1.5h-12.5" />
                </svg>
                Vehicle Information
              </h2>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Make & Model</div>
                  <div className="font-medium">
                    {session.car.make} {session.car.model}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700/30">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Year</div>
                    <div className="text-sm">{session.car?.year || "N/A"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">
                      Plate Number
                    </div>
                    <div className="text-sm">
                      {session.car?.plateNumber || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700/30">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Color</div>
                    <div className="text-sm">{session.car?.color || "N/A"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">VIN</div>
                    <div
                      className="text-sm truncate"
                      title={session.car?.vin || "N/A"}
                    >
                      {session.car?.vin || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Session Details */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Session Operations */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/50">
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
                <path d="M3.5 5.5l1.5 1.5l2.5 -2.5" />
                <path d="M3.5 11.5l1.5 1.5l2.5 -2.5" />
                <path d="M3.5 17.5l1.5 1.5l2.5 -2.5" />
                <path d="M11 6l9 0" />
                <path d="M11 12l9 0" />
                <path d="M11 18l9 0" />
              </svg>
              Session Operations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="bg-gray-700/70 border border-gray-600/30 p-4 rounded-lg hover:bg-gray-700/90 transition-colors text-left flex items-start gap-3">
                <div className="bg-blue-500/20 p-2.5 rounded text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 21h-10a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h18a3 3 0 0 1 3 3v7" />
                    <path d="M3 9l18 0" />
                    <path d="M15 17l2 2l4 -4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Inspection</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {session.inspection
                      ? "View saved inspection"
                      : "Create an inspection "}
                  </p>
                </div>
              </button>

              <button className="bg-gray-700/70 border border-gray-600/30 p-4 rounded-lg hover:bg-gray-700/90 transition-colors text-left flex items-start gap-3">
                <div className="bg-blue-500/20 p-2.5 rounded text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                    <path d="M9 17h6" />
                    <path d="M9 13h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Job Card</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {session.jobcard ? "View job card" : "Create a job card"}
                  </p>
                </div>
              </button>

              <button className="bg-gray-700/70 border border-gray-600/30 p-4 rounded-lg hover:bg-gray-700/90 transition-colors text-left flex items-start gap-3">
                <div className="bg-blue-500/20 p-2.5 rounded text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 7h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
                    <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
                    <path d="M16 5l3 3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Quotation</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {session.quotation
                      ? "View saved quotation"
                      : "Create a quotation"}
                  </p>
                </div>
              </button>

              <button className="bg-gray-700/70 border border-gray-600/30 p-4 rounded-lg hover:bg-gray-700/90 transition-colors text-left flex items-start gap-3">
                <div className="bg-blue-500/20 p-2.5 rounded text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2" />
                    <path d="M14 8h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
                    <path d="M12 7v1m0 8v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Invoice</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Generate an invoice for this session
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Session Activity Log */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/50">
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
                <path d="M12 6l0 6l3 3" />
                <path d="M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18" />
              </svg>
              Activity Log
            </h2>

            <div className="space-y-4">
              <div className="relative pl-6 pb-4 border-l-2 border-blue-500/30">
                <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-blue-500"></div>
                <div className="text-sm text-gray-300">
                  <span className="font-medium">Session created</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {session.createdAt ? formatDate(session.createdAt) : "N/A"}
                </div>
              </div>

              <div className="relative pl-6 pb-4 border-l-2 border-gray-700/30">
                <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-gray-500"></div>
                <div className="text-sm text-gray-300">
                  <span className="font-medium">
                    Session status: {session.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {session.updatedAt
                    ? formatDate(session.updatedAt)
                    : formatDate(session.createdAt)}
                </div>
              </div>

              {/* This would be populated with actual activities from the API */}
              <div className="text-center text-sm text-gray-400 pt-2">
                No additional activities to show
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Entries */}
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 pb-2 border-b border-gray-700/50">
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
            <path d="M3 3h18v18H3z" />
          </svg>
          Session Entries
        </h2>

        {/* Entries List */}
        <div className="space-y-4">
          {entriesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : sessionEntries.length > 0 ? (
            <SessionEntries entries={sessionEntries} />
          ) : (
            <div className="text-center py-8 text-gray-400">
              No entries yet. Add the first entry below.
            </div>
          )}

          {/* Entry Form */}
          <SessionEntryForm
            sessionId={sessionId}
            onEntryCreated={fetchSessionEntries}
          />
        </div>
      </div>
    </div>
  );
}
