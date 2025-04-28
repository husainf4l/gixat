import React from "react";
import { Client } from "../../services/client/api";
import { Vehicle } from "../../services/client/api";

interface ClientInfoCardProps {
  client: Client;
  primaryVehicle: Vehicle | null;
  onNewSession: () => void;
  isCreatingSession: boolean;
  lastVisitDate: string | null;
}

export function ClientInfoCard({
  client,
  primaryVehicle,
  onNewSession,
  isCreatingSession,
  lastVisitDate,
}: ClientInfoCardProps) {
  return (
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
                    <div className="text-xs text-gray-400">Plate Number</div>
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
                {lastVisitDate || "No visits yet"}
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
          onClick={onNewSession}
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
  );
}
