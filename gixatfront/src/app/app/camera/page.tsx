"use client";

import React, { useEffect, useRef, useState } from "react";
import { cameraService, type CameraServiceState } from "@/services/camera";
import { widdPostService, type WiddPostResponse } from "@/services/widdpost";
import { CameraPermission } from "@/components/camera/CameraPermission";
import { CameraOverlay } from "@/components/camera/CameraOverlay";
import {
  RefreshIcon,
  PlayIcon,
  FullscreenIcon,
  MinimizeIcon,
  CameraIcon,
} from "@/components/icons/CameraIcons";

export default function CameraPage() {
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

  // WiddPost specific states
  const [mood, setMood] = useState<string>("happy");
  const [hints, setHints] = useState<string>("");
  const [postResult, setPostResult] = useState<WiddPostResponse | null>(null);
  const [showPostResult, setShowPostResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
      // Stop current stream
      cameraService.stopCamera(videoRef);
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

  // Capture a photo and create widdpost
  const capturePhotoForPost = async () => {
    if (!state.isVideoPlaying || !videoRef.current) {
      console.warn("Cannot capture photo: Video is not playing");
      return;
    }

    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas) {
      console.error("Canvas element not found");
      setIsProcessing(false);
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
      setIsProcessing(false);
      return;
    }

    try {
      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      // Convert the canvas to a data URL (JPEG format for smaller size)
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);

      // Convert the data URL to a File object
      const blobData = await fetch(imageDataUrl).then((r) => r.blob());
      const imageFile = new File([blobData], "widdpost-capture.jpg", {
        type: "image/jpeg",
      });

      // Set loading state or notification
      setShowCaptureSuccess(true);

      try {
        // Call widdpost API service
        const response = await widdPostService.createPost(
          imageFile,
          mood,
          hints
        );
        console.log("WiddPost creation response:", response);

        setPostResult(response);
        setShowPostResult(true);
      } catch (error) {
        console.error("Error creating WiddPost:", error);
        setPostResult({
          status: "error",
          message: "Failed to create post. Please try again.",
        });
        setShowPostResult(true);
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
    } finally {
      setIsProcessing(false);
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

      {/* Always render the video element but keep it hidden until needed */}
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
                className="text-white mx-2 p-2 bg-gray-700 rounded-full hover:bg-blue-700 flex items-center justify-center"
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
                  onClick={capturePhotoForPost}
                  disabled={isProcessing}
                  className={`text-white mx-2 p-2 ${
                    isProcessing
                      ? "bg-gray-500"
                      : "bg-gray-700 hover:bg-red-700"
                  } rounded-full flex items-center justify-center`}
                  title="التقاط صورة لإنشاء منشور"
                >
                  {isProcessing ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    <CameraIcon />
                  )}
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

        {/* WiddPost Form - Only visible when camera is granted and video is playing */}
        {state.permissionState === "granted" && state.isVideoPlaying && (
          <div className="absolute top-4 right-4 bg-gray-900/80 p-4 rounded-lg backdrop-blur-sm w-64">
            <h3 className="text-white text-lg font-semibold mb-3">
              إعدادات المنشور
            </h3>

            <div className="mb-3">
              <label className="block text-gray-300 text-sm mb-1">
                الحالة المزاجية
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 text-sm"
              >
                <option value="happy">سعيد</option>
                <option value="excited">متحمس</option>
                <option value="proud">فخور</option>
                <option value="focused">مركز</option>
                <option value="calm">هادئ</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-gray-300 text-sm mb-1">
                تلميحات للمحتوى
              </label>
              <textarea
                value={hints}
                onChange={(e) => setHints(e.target.value)}
                placeholder="أضف تلميحات للمحتوى المنشور مثل: مباراة، نادي، لاعب مميز، إلخ"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded px-2 py-1.5 h-20 text-sm resize-none"
              />
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

      {/* WiddPost Result Modal */}
      {showPostResult && postResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden border border-gray-700 shadow-xl">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
              <h3 className="font-semibold text-lg">نتيجة إنشاء المنشور</h3>
              <button
                onClick={() => setShowPostResult(false)}
                className="text-white hover:bg-blue-800 rounded-full p-1.5"
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
            </div>

            <div className="p-5">
              {postResult.status === "loading" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-white">جاري إنشاء المنشور...</p>
                </div>
              )}

              {postResult.status === "error" && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-white">
                  <p className="font-medium mb-2">حدث خطأ</p>
                  <p>{postResult.message}</p>
                </div>
              )}

              {postResult.status === "success" && (
                <div className="space-y-5">
                  {/* Post Preview Section */}
                  <div className="bg-gray-900 rounded-xl p-5 border border-gray-700 shadow-inner">
                    {/* Mood indicator and timestamp */}
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        <span>الحالة: {postResult.mood || mood}</span>
                      </div>
                      {postResult.generatedAt && (
                        <div>
                          {new Date(postResult.generatedAt).toLocaleDateString(
                            "ar-SA",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    {postResult.content && (
                      <div className="mb-4 text-white">
                        <p className="text-lg leading-relaxed">
                          {postResult.content}
                        </p>
                      </div>
                    )}

                    {/* Hashtags */}
                    {postResult.hashtags && postResult.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {postResult.hashtags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          window.navigator.clipboard.writeText(
                            postResult.content || ""
                          )
                        }
                        className="bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                        نسخ المحتوى
                      </button>

                      <button
                        onClick={() =>
                          window.navigator.clipboard.writeText(
                            (postResult.hashtags || []).join(" ")
                          )
                        }
                        className="bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                          />
                        </svg>
                        نسخ الهاشتاقات
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const fullPost = `${postResult.content || ""}\n\n${(
                          postResult.hashtags || []
                        ).join(" ")}`;
                        window.navigator.clipboard.writeText(fullPost);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                        />
                      </svg>
                      نسخ المنشور كاملاً
                    </button>

                    <button
                      onClick={() => setShowPostResult(false)}
                      className="bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
