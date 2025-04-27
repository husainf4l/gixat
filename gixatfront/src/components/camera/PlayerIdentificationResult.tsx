import React from "react";
import { PlayerIdentificationResponse } from "@/services/analysis/player";

interface PlayerIdentificationResultProps {
  playerInfo: PlayerIdentificationResponse | null;
  isVisible: boolean;
  onClose: () => void;
}

export const PlayerIdentificationResult: React.FC<
  PlayerIdentificationResultProps
> = ({ playerInfo, isVisible, onClose }) => {
  if (!isVisible || !playerInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex  p-4">
      <div
        className="absolute inset-0 "
        onClick={playerInfo.status !== "loading" ? onClose : undefined}
      ></div>
      <div className="relative bg-gray-950/30 rounded-xl shadow-xl p-6 max-w-md w-full text-white mr-20 mt-20 overflow-y-auto max-h-[80vh]">
        {playerInfo.status !== "loading" && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/50 rounded-full text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Loading State */}
        {playerInfo.status === "loading" ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <h2 className="text-xl font-semibold">Identifying Player</h2>
            <p className="text-gray-300 mt-2">
              Please wait while we process your image...
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">
              {playerInfo.status === "success" ? "" : "Identification Failed"}
            </h2>

            {playerInfo.status === "success" ? (
              <div className="space-y-4">
                {playerInfo.player ? (
                  /* New response format with player object */
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden">
                        {playerInfo.player.imageUrl ? (
                          <img
                            src={playerInfo.player.imageUrl}
                            alt={playerInfo.player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          playerInfo.player.number
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {playerInfo.player.name}
                        </h3>
                        <p className="">
                          {playerInfo.player.position} |{" "}
                          {playerInfo.player.number}
                        </p>
                        <p className=" text-sm">
                          {playerInfo.player.nationality}
                        </p>
                      </div>
                    </div>

                    {playerInfo.playerPerformance && (
                      <div className="mt-4 pt-4 border-t border-white/50">
                        <h4 className="text-lg font-semibold mb-3">
                          Performance Metrics
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className=" text-xs">Top Speed</p>
                            <p className="text-lg font-bold">
                              {playerInfo.playerPerformance.topSpeed} km/h
                            </p>
                          </div>
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className=" text-xs">Avg Speed</p>
                            <p className="text-lg font-bold">
                              {playerInfo.playerPerformance.avgSpeed} km/h
                            </p>
                          </div>
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className=" text-xs">Distance</p>
                            <p className="text-lg font-bold">
                              {playerInfo.playerPerformance.distanceKm} km
                            </p>
                          </div>
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className=" text-xs">Sprints</p>
                            <p className="text-lg font-bold">
                              {playerInfo.playerPerformance.sprintCount}
                            </p>
                          </div>
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className=" text-xs">Passes</p>
                            <p className="text-lg font-bold">
                              {playerInfo.playerPerformance.passesCompleted}
                            </p>
                          </div>
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <p className=" text-xs">Shots on Target</p>
                            <p className="text-lg font-bold">
                              {playerInfo.playerPerformance.shotsOnTarget}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-md font-semibold mb-2">
                            Physical Metrics
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className=" text-xs">Heart Rate (Avg)</p>
                              <p className="text-lg font-bold">
                                {playerInfo.playerPerformance.heartRateAvg} bpm
                              </p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className=" text-xs">Heart Rate (Max)</p>
                              <p className="text-lg font-bold">
                                {playerInfo.playerPerformance.heartRateMax} bpm
                              </p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className=" text-xs">Fatigue Score</p>
                              <p className="text-lg font-bold">
                                {playerInfo.playerPerformance.fatigueScore}/10
                              </p>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg">
                              <p className=" text-xs">Stamina</p>
                              <p className="text-lg font-bold">
                                {playerInfo.playerPerformance.staminaScore}/10
                              </p>
                            </div>
                          </div>
                        </div>

                        {playerInfo.playerPerformance.heatmapUrl && (
                          <div className="mt-4">
                            <h4 className="text-md font-semibold mb-2">
                              Heatmap
                            </h4>
                            <div className="bg-gray-800/50 p-2 rounded-lg">
                              <img
                                src={playerInfo.playerPerformance.heatmapUrl}
                                alt="Player Heatmap"
                                className="w-full rounded"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  /* Legacy format fallback */
                  <>
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
                        {playerInfo.playerNumber}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold mb-1"></p>
                      <p className="text-gray-300">{playerInfo.message}</p>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={onClose}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                {/* Error icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-red-400 mb-4">{playerInfo.message}</p>
                {/* Troubleshooting tips */}
                <div className="bg-gray-800/50 p-3 rounded-lg mb-4 text-left text-sm">
                  <p className="font-semibold mb-1">Troubleshooting tips:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>Make sure the player is clearly visible</li>
                    <li>Ensure good lighting conditions</li>
                    <li>Try capturing from a different angle</li>
                    <li>Check your internet connection</li>
                  </ul>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
