"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { sessionService, Session } from "../../../../../services/session/api";
import SessionEntries, {
  SessionEntryData,
} from "../../../../../components/session/SessionEntries";
import SessionEntryForm from "../../../../../components/session/SessionEntryForm";

export default function SessionEntryPage() {
  const router = useRouter();
  const { id } = useParams();
  const sessionId = id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionEntries, setSessionEntries] = useState<SessionEntryData[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  // Fetch session data
  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true);
      try {
        const sessionData = await sessionService.getSessionById(sessionId);
        setSession(sessionData);
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

  // Fetch session entries
  const fetchSessionEntries = async () => {
    setEntriesLoading(true);
    try {
      const entries = await sessionService.getSessionEntries(sessionId);
      setSessionEntries(entries);
    } catch (err) {
      console.error("Error fetching session entries:", err);
      // In case of an error, we'll show an empty list
      setSessionEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  };

  // Fetch entries when the component mounts or sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchSessionEntries();
    }
  }, [sessionId]);

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

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 md:h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-3 md:mt-4 text-sm md:text-base">
            Loading session data...
          </p>
        </div>
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

  return (
    <div className="space-y-4 md:space-y-8 px-1 md:px-0 pb-16 md:pb-6">
      {/* Back button */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push(`/app/sessions/${sessionId}`)}
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
          Back to Session
        </button>

        <Link href="/app/sessions">
          <button className="text-gray-400 hover:text-white text-sm">
            View All Sessions
          </button>
        </Link>
      </div>

      {/* Session Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
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
              <path d="M8 10h8" />
              <path d="M8 14h4" />
              <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold">Session Entries</h1>
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

        {session.customerId && (
          <div className="flex items-center gap-3 bg-gray-700/50 px-3 py-2 rounded-lg">
            <div className="bg-blue-500/20 rounded-full h-10 w-10 flex items-center justify-center text-blue-400 shrink-0">
              <span className="text-lg font-semibold">C</span>
            </div>
            <div>
              <div className="font-medium text-sm">
                Client #{session.customerId}
              </div>
              <div className="text-gray-400 text-xs">
                ID: {session.customerId}
              </div>
            </div>
            <Link href={`/app/clients/${session.customerId}`}>
              <button className="text-blue-400 hover:text-blue-300 ml-2">
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
                  <path d="M5 12l14 0" />
                  <path d="M13 18l6 -6" />
                  <path d="M13 6l6 6" />
                </svg>
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Session Entries and Entry Form */}
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
          Entries
        </h2>

        {/* Entries List */}
        <div className="space-y-4 mb-6">
          {entriesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <SessionEntries entries={sessionEntries} />
          )}
        </div>

        {/* Entry Form */}
        <SessionEntryForm
          sessionId={sessionId}
          onEntryCreated={fetchSessionEntries}
        />
      </div>
    </div>
  );
}
