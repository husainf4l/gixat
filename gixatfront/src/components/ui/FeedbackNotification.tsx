import React from "react";

type FeedbackType = "success" | "error";

interface FeedbackNotificationProps {
  message: string;
  type: FeedbackType;
  onDismiss: () => void;
}

export function FeedbackNotification({
  message,
  type,
  onDismiss,
}: FeedbackNotificationProps) {
  return (
    <div
      className={`fixed right-4 top-20 max-w-sm p-4 rounded-lg shadow-lg z-50 border transition-opacity duration-300 ${
        type === "success"
          ? "bg-green-800/90 border-green-600"
          : "bg-red-800/90 border-red-600"
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === "success" ? (
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
              type === "success" ? "text-green-200" : "text-red-200"
            }`}
          >
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onDismiss}
              className={`inline-flex p-1.5 rounded-md focus:outline-none ${
                type === "success"
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
  );
}
