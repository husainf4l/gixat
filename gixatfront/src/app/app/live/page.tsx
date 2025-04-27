"use client";

import React, { useEffect, useRef, useState } from "react";
import { cameraService, type CameraServiceState } from "@/services/camera";
import { CameraPermission } from "@/components/camera/CameraPermission";
import { CameraOverlay } from "@/components/camera/CameraOverlay";
import { PlayerIdentificationResult } from "@/components/camera/PlayerIdentificationResult";
import {
  RefreshIcon,
  PlayIcon,
  FullscreenIcon,
  MinimizeIcon,
  CameraIcon,
} from "@/components/icons/CameraIcons";
import {
  playerService,
  PlayerIdentificationResponse,
} from "@/services/analysis/player";

export default function LivePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CameraServiceState>({
    permissionState: "not-requested",
    errorMessage: null,
    hasCamera: null,
    cameraDevices: [],
    selectedCamera: null,
    isVideoPlaying: false,
    isFullscreen: false,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showCaptureSuccess, setShowCaptureSuccess] = useState(false);
  const [playerInfo, setPlayerInfo] =
    useState<PlayerIdentificationResponse | null>(null);
  const [showPlayerInfo, setShowPlayerInfo] = useState(false);

  // Helper function to update state
  const updateState = (update: Partial<CameraServiceState>) => {
    setState((prevState) => ({ ...prevState, ...update }));
  };

  // Ensure the component is fully mounted before proceeding
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    if (!isMounted) return;

    const handleFullscreenChange = () => {
      cameraService.handleFullscreenChange(updateState);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isMounted]);

  // Run camera check when component is mounted
  useEffect(() => {
    if (isMounted) {
      checkCameraAvailability();
    }
  }, [isMounted]);

  // Add video playing event listener once component is mounted
  useEffect(() => {
    if (!isMounted) return;

    const videoElement = videoRef.current;
    if (videoElement) {
      console.log("Setting up video event listeners");

      // Add event listeners to detect when video starts playing
      videoElement.onplaying = () => {
        console.log("Video is now playing!");
        updateState({ isVideoPlaying: true });
      };

      // Also listen for loadedmetadata event which fires when video metadata is loaded
      videoElement.onloadedmetadata = () => {
        console.log("Video metadata loaded");
      };

      // Add error event listener
      videoElement.onerror = (e) => {
        console.error("Video element error:", e);
      };
    } else {
      console.warn("Video ref is null during event listener setup");
    }

    return () => {
      // Remove event listeners
      if (videoElement) {
        videoElement.onplaying = null;
        videoElement.onloadedmetadata = null;
        videoElement.onerror = null;
      }
    };
  }, [isMounted]);

  // Switch camera when selection changes
  useEffect(() => {
    if (!isMounted) return;

    if (state.permissionState === "granted" && state.selectedCamera) {
      updateState({ isVideoPlaying: false });

      // Set up new camera
      cameraService.setupCamera(videoRef, state.selectedCamera, updateState);
    }
  }, [state.selectedCamera, isMounted, state.permissionState]);

  // Hide capture success message after delay
  useEffect(() => {
    if (showCaptureSuccess) {
      const timer = setTimeout(() => {
        setShowCaptureSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCaptureSuccess]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      cameraService.stopCamera(videoRef);
    };
  }, []);

  // Check if device has any cameras available
  const checkCameraAvailability = async () => {
    try {
      const result = await cameraService.checkCameraAvailability();
      setState((prevState) => ({
        ...prevState,
        hasCamera: result.hasCamera,
        cameraDevices: result.cameraDevices,
        selectedCamera: result.selectedCamera,
        permissionState: result.permissionState,
        errorMessage: result.errorMessage,
      }));
    } catch (err) {
      console.error("Error in checkCameraAvailability:", err);
    }
  };

  // Manual refresh to detect new cameras
  const refreshCameras = async () => {
    updateState({
      permissionState: "loading",
      errorMessage: null,
      isVideoPlaying: false,
    });
    await checkCameraAvailability();
  };

  // Function to manually force video to play
  const forcePlay = () => {
    cameraService.forcePlay(videoRef, updateState);
  };

  // Use fallback background if no camera is available
  const useFallbackBackground = () => {
    cameraService.stopCamera(videoRef);
    updateState({
      permissionState: "granted",
      errorMessage: null,
      isVideoPlaying: false,
    });
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    await cameraService.toggleFullscreen(videoContainerRef, updateState);
  };

  // Capture a photo from the current video stream
  const capturePhoto = async () => {
    if (!state.isVideoPlaying || !videoRef.current) {
      console.warn("Cannot capture photo: Video is not playing");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }

    // Set canvas dimensions to match the video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Draw the current video frame on the canvas
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Could not get canvas context");
      return;
    }

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Convert the canvas to a data URL (JPEG format for smaller size)
    try {
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // Convert the data URL to a File object
      const blobData = await fetch(imageDataUrl).then((r) => r.blob());
      const imageFile = new File([blobData], "camera-capture.jpg", {
        type: "image/jpeg",
      });

      // Set loading state or notification
      setShowCaptureSuccess(true);

      // Prepare match information
      const matchInfo = {
        status: "live",
        homeTeam: "Saudi Arabia",
        awayTeam: "Argentina",
        stadium: "Main Stadium",
      };

      // Send to backend
      try {
        // Show loading indicator (could be enhanced with a dedicated loading UI)
        setPlayerInfo({
          status: "loading",
          playerNumber: 0,
          team: "",
          message: "Identifying player...",
        });
        setShowPlayerInfo(true);

        const response = await playerService.uploadFileForIdentification(
          imageFile,
          matchInfo
        );
        console.log("Player identification response:", response);

        // The response will always have a status field now due to our improved error handling
        setPlayerInfo(response);

        // Show capture success notification only for successful identifications
        setShowCaptureSuccess(response.status === "success");
      } catch (error) {
        // This should rarely happen now since our service handles errors internally
        console.error("Unexpected error in photo capture:", error);
        setShowCaptureSuccess(false);
        setPlayerInfo({
          status: "error",
          playerNumber: 0,
          team: "",
          message: "Unexpected error occurred. Please try again.",
        });
        setShowPlayerInfo(true);
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  // Render early if not mounted yet
  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" ref={videoContainerRef}>
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Always render the video element but keep it hidden until needed - this ensures the ref is always available */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover z-0 ${
          state.permissionState !== "granted" || !videoRef.current?.srcObject
            ? "hidden"
            : ""
        }`}
        style={{ objectFit: "cover", imageRendering: "auto" }}
        onClick={forcePlay}
      />

      {/* Fallback background when video is not showing */}
      {(state.permissionState !== "granted" ||
        !videoRef.current?.srcObject) && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 z-0">
          <div className="absolute inset-0 opacity-20 bg-grid-white"></div>
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
        {/* Camera Overlay - only shows when camera is working successfully */}
        <CameraOverlay state={state} videoRef={videoRef} />

        {/* Status indicator when camera is granted but might not be playing */}
        {state.permissionState === "granted" &&
          videoRef.current &&
          videoRef.current.srcObject &&
          !state.isVideoPlaying && (
            <div className="bg-amber-500/90 text-amber-950 p-3 rounded-lg max-w-sm text-center mb-4">
              <p>تم توصيل الكاميرا ولكن البث لم يبدأ بعد.</p>
              <button
                onClick={forcePlay}
                className="mt-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-1 rounded-md text-sm"
              >
                انقر لبدء البث
              </button>
            </div>
          )}

        {/* Success message when a photo is captured */}
        {showCaptureSuccess && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white p-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-fade-in-out">
            <span>تم التقاط الصورة بنجاح!</span>
          </div>
        )}

        {/* Camera Controls when granted */}
        {state.permissionState === "granted" && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="bg-gray-900/90 text-white px-4 py-2 rounded-full flex items-center">
              {state.cameraDevices.length > 1 && (
                <div className="flex items-center mr-2">
                  <CameraIcon />
                  <select
                    value={state.selectedCamera || ""}
                    onChange={(e) =>
                      updateState({ selectedCamera: e.target.value })
                    }
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {state.cameraDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label ||
                          `كاميرا ${device.deviceId.slice(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={refreshCameras}
                className="text-white mx-2 p-2 bg-gray-700  rounded-full hover:bg-blue-700 flex items-center justify-center"
                title="تحديث الكاميرات"
              >
                <RefreshIcon />
              </button>
              {videoRef.current &&
                videoRef.current.srcObject &&
                !state.isVideoPlaying && (
                  <button
                    onClick={forcePlay}
                    className="text-white mx-2 p-2 bg-amber-600 rounded-full hover:bg-amber-700 flex items-center justify-center"
                    title="بدء البث"
                  >
                    <PlayIcon />
                  </button>
                )}
              {/* Capture Photo Button */}
              {state.isVideoPlaying && (
                <button
                  onClick={capturePhoto}
                  className="text-white mx-2 p-2 bg-gray-700 rounded-full hover:bg-red-700 flex items-center justify-center"
                  title="التقاط صورة"
                >
                  <CameraIcon />
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="text-white mx-2 p-2 bg-gray-700 rounded-full hover:bg-gray-600 flex items-center justify-center"
              >
                {state.isFullscreen ? <MinimizeIcon /> : <FullscreenIcon />}
              </button>
            </div>
          </div>
        )}

        {/* Camera Permission UI - Using the extracted component */}
        {state.permissionState !== "granted" && (
          <CameraPermission
            state={state}
            updateState={updateState}
            videoRef={videoRef}
            showAdvancedOptions={showAdvancedOptions}
            setShowAdvancedOptions={setShowAdvancedOptions}
            refreshCameras={refreshCameras}
            useFallbackBackground={useFallbackBackground}
          />
        )}
      </div>

      {/* Player Identification Results Modal */}
      <PlayerIdentificationResult
        playerInfo={playerInfo}
        isVisible={showPlayerInfo}
        onClose={() => setShowPlayerInfo(false)}
      />
    </div>
  );
}
