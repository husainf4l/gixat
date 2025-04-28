import React from "react";
import { useRouter } from "next/navigation";
import { Session, SessionStatus } from "../../services/session/api";
import { formatDate } from "../../lib/utils";

interface SessionHistoryCardProps {
  sessions: Session[];
  onNewSession: () => void;
  isCreatingSession: boolean;
}

export function SessionHistoryCard({
  sessions,
  onNewSession,
  isCreatingSession,
}: SessionHistoryCardProps) {
  const router = useRouter();

  return (
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
          onClick={onNewSession}
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

      {sessions.length > 0 ? (
        <div className="space-y-3 md:space-y-4">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <EmptySessionHistory
          onNewSession={onNewSession}
          isCreatingSession={isCreatingSession}
        />
      )}
    </div>
  );
}

function SessionCard({ session }: { session: Session }) {
  const router = useRouter();

  return (
    <div
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
              ${session.status === SessionStatus.OPEN ? "text-yellow-400" : ""}
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
              ${session.status === SessionStatus.CLOSED ? "text-red-400" : ""}
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
  );
}

function EmptySessionHistory({
  onNewSession,
  isCreatingSession,
}: {
  onNewSession: () => void;
  isCreatingSession: boolean;
}) {
  return (
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
        onClick={onNewSession}
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
  );
}
