// Display the session entries
import React from "react";
import { SessionEntry } from "../../services/session/api";

export type SessionEntryData = SessionEntry;

type SessionEntriesProps = {
  entries: SessionEntryData[];
};

const SessionEntries: React.FC<SessionEntriesProps> = ({ entries }) => {
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

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 px-4">
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
              <path d="M8 10h8" />
              <path d="M8 14h4" />
              <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
            </svg>
          </div>
        </div>
        <p className="text-gray-400 text-sm">
          No entries available for this session yet.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Add notes, images, or voice recordings using the form below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="p-4 bg-gray-700/50 border border-gray-600/30 rounded-lg"
        >
          <div className="flex items-start gap-3 mb-3">
            {/* User avatar or default icon */}
            <div className="flex-shrink-0">
              {entry.user?.avatar ? (
                <img
                  src={entry.user.avatar}
                  alt={entry.user.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <span className="text-lg font-semibold">
                    {entry.user?.name
                      ? entry.user.name.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                </div>
              )}
            </div>

            {/* Entry header */}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-white">
                    {entry.user?.name || "User"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(entry.createdAt)}
                  </div>
                </div>

                {/* Entry type badge */}
                <div
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    entry.type === "text"
                      ? "bg-blue-500/20 text-blue-400"
                      : entry.type === "image"
                      ? "bg-green-500/20 text-green-400"
                      : entry.type === "voice"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Entry content based on type */}
          <div className="ml-13 pl-13">
            {/* Text or Note content */}
            {(entry.type === "TEXT" || entry.type === "NOTE") &&
              entry.originalMessage && (
                <div className="text-gray-200 mt-2 ml-13">
                  {entry.cleanedMessage || entry.originalMessage}
                </div>
              )}

            {/* Image content */}
            {entry.type === "IMAGE" && entry.photoUrl && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={entry.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={entry.photoUrl}
                    alt="Uploaded image"
                    className="rounded-md object-cover w-full h-32 bg-gray-800"
                  />
                </a>
              </div>
            )}

            {/* Voice recording */}
            {(entry.type === "VOICE" ||
              (entry.type === "MIXED" && entry.audioUrl)) && (
              <div className="mt-3 bg-gray-800/70 rounded-lg p-3 flex items-center">
                <div className="bg-purple-500/20 p-2 rounded-full text-purple-400 mr-3">
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
                    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    <path d="M12 19c-4.286 0 -7.5 -3.5 -7.5 -7.5v-4a7.5 7.5 0 0 1 15 0v4c0 4 -3.214 7.5 -7.5 7.5z" />
                  </svg>
                </div>
                <audio controls className="w-full h-10">
                  <source src={entry.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Mixed media - show both text and media */}
            {entry.type === "MIXED" && entry.originalMessage && (
              <div className="text-gray-200 mt-2 ml-13">
                {entry.cleanedMessage || entry.originalMessage}
              </div>
            )}

            {entry.type === "MIXED" && entry.photoUrl && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={entry.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={entry.photoUrl}
                    alt="Uploaded image"
                    className="rounded-md object-cover w-full h-32 bg-gray-800"
                  />
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionEntries;
