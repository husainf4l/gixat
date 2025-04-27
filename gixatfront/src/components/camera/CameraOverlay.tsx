import React from "react";
import type { CameraServiceState } from "@/services/camera";

interface CameraOverlayProps {
  state: CameraServiceState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function CameraOverlay({ state, videoRef }: CameraOverlayProps) {
  // Only render when the camera is working properly
  const isCameraWorking =
    state.permissionState === "granted" &&
    videoRef.current?.srcObject &&
    state.isVideoPlaying;

  if (!isCameraWorking) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="bg-black/40 px-6 py-3 rounded-lg backdrop-blur-sm mb-4">
          <h1 className="text-white text-2xl font-medium">
            الكاميرا تعمل بنجاح
          </h1>
        </div>

        {/* Additional content can be added here */}
      </div>
    </div>
  );
}
