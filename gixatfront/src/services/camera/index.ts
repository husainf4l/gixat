// Camera service to handle all camera-related functionality
// This service abstracts camera operations from the UI components

export type CameraPermissionState =
  | "not-requested"
  | "granted"
  | "denied"
  | "loading"
  | "unavailable"
  | "timeout";

export type CameraDeviceInfo = MediaDeviceInfo;

export interface CameraServiceState {
  permissionState: CameraPermissionState;
  errorMessage: string | null;
  hasCamera: boolean | null;
  cameraDevices: CameraDeviceInfo[];
  selectedCamera: string | null;
  isVideoPlaying: boolean;
  isFullscreen: boolean;
}

class CameraService {
  private timeoutRef: NodeJS.Timeout | null = null;

  /**
   * Check if the device has any cameras available
   */
  async checkCameraAvailability(): Promise<{
    hasCamera: boolean;
    cameraDevices: MediaDeviceInfo[];
    selectedCamera: string | null;
    permissionState: CameraPermissionState;
    errorMessage: string | null;
  }> {
    try {
      // First check if the mediaDevices API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return {
          hasCamera: false,
          cameraDevices: [],
          selectedCamera: null,
          permissionState: "unavailable",
          errorMessage: "Your browser doesn't support camera access.",
        };
      }

      // We need to request permission first to get labeled devices in some browsers
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        // Stop the stream immediately after getting permissions
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        // Ignore errors here, we'll handle them later
        console.warn("Permission check failed:", err);
      }

      // Now enumerate devices after permission request
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");

      console.log("Available cameras:", cameras.length);
      cameras.forEach((camera, index) => {
        console.log(`Camera ${index}: ${camera.label || "unlabeled camera"}`);
      });

      // Set default selected camera if cameras are found
      const selectedCamera = cameras.length > 0 ? cameras[0].deviceId : null;
      const permissionState = cameras.length > 0 ? "not-requested" : "unavailable";
      const errorMessage = cameras.length > 0 ? null : "No camera found on this device.";

      return {
        hasCamera: cameras.length > 0,
        cameraDevices: cameras,
        selectedCamera,
        permissionState,
        errorMessage,
      };
    } catch (err) {
      console.error("Error checking camera availability:", err);
      return {
        hasCamera: false,
        cameraDevices: [],
        selectedCamera: null,
        permissionState: "unavailable",
        errorMessage: "Failed to detect cameras.",
      };
    }
  }

  /**
   * Request access to the camera and set up the video stream
   */
  async requestCameraPermission(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    selectedCamera: string | null,
    onStateChange: (update: Partial<CameraServiceState>) => void
  ): Promise<void> {
    // First check if the video element exists
    if (!videoRef.current) {
      console.error("Video element not found when requesting permission");
      onStateChange({
        permissionState: "denied",
        errorMessage: "Video element not found. Please try refreshing the page.",
        isVideoPlaying: false,
      });
      return;
    }

    onStateChange({
      permissionState: "loading",
      errorMessage: null,
      isVideoPlaying: false,
    });

    // Set a timeout to detect if camera stream initialization hangs
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }

    this.timeoutRef = setTimeout(() => {
      // If we get here, camera initialization took too long
      console.log("Camera stream initialization timed out");
      
      onStateChange({
        permissionState: "timeout",
        errorMessage: "Camera access timed out. The camera may be in use by another application or not responding.",
      });

      // Try to stop any pending tracks that might be hanging
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }, 10000); // 10 second timeout

    try {
      await this.setupCamera(videoRef, selectedCamera, onStateChange);
    } catch (err) {
      console.error("Error in permission flow:", err);
      
      onStateChange({
        permissionState: "denied",
        errorMessage: "Failed to access camera.",
      });

      if (this.timeoutRef) {
        clearTimeout(this.timeoutRef);
        this.timeoutRef = null;
      }
    }
  }

  /**
   * Set up the camera stream with the selected camera
   */
  async setupCamera(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    selectedCamera: string | null,
    onStateChange: (update: Partial<CameraServiceState>) => void
  ): Promise<void> {
    try {
      // Check if the video element exists before proceeding
      if (!videoRef.current) {
        console.error("Video element not found when setting up camera");
        
        onStateChange({
          permissionState: "denied",
          errorMessage: "Video element not found. Please try refreshing the page.",
        });

        if (this.timeoutRef) {
          clearTimeout(this.timeoutRef);
          this.timeoutRef = null;
        }
        return;
      }

      console.log("Setting up camera with device ID:", selectedCamera || "default");

      // First clear any existing stream
      if (videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => {
          console.log(`Stopping existing track: ${track.kind} - ${track.label}`);
          track.stop();
        });
        videoRef.current.srcObject = null;
      }

      // Build high-quality video constraints
      const videoConstraints: MediaTrackConstraints = {
        // Set specific device if selected
        ...(selectedCamera ? { deviceId: { exact: selectedCamera } } : {}),
        // High quality settings
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        aspectRatio: 16 / 9,
        frameRate: { ideal: 30, min: 24 },
        // Request highest quality available
        advanced: [
          { width: { min: 1920 }, height: { min: 1080 } },
          { width: { min: 1280 }, height: { min: 720 } },
          { frameRate: 30 },
        ],
      };

      const constraints = {
        video: videoConstraints,
        audio: false,
      };

      console.log("Requesting camera with high-quality constraints:", JSON.stringify(constraints));
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Log the actual track settings we received
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        console.log("Actual camera settings:", settings);
        console.log(`Resolution: ${settings.width}x${settings.height}, Frame rate: ${settings.frameRate}`);
      }

      console.log("Camera stream obtained successfully");

      // Check again if the video element exists, it might have been unmounted
      if (!videoRef.current) {
        console.error("Video element not found after obtaining stream");
        
        onStateChange({
          permissionState: "denied",
          errorMessage: "Video element not found. Please try refreshing the page.",
        });

        // Clean up the stream since we can't attach it
        stream.getTracks().forEach((track) => track.stop());

        if (this.timeoutRef) {
          clearTimeout(this.timeoutRef);
          this.timeoutRef = null;
        }
        return;
      }

      // Set the stream to the video element
      console.log("Setting srcObject on video element");
      videoRef.current.srcObject = stream;

      // Force playing the video
      try {
        console.log("Attempting to play video");
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video playback started successfully");
              
              onStateChange({
                permissionState: "granted",
                errorMessage: null,
                isVideoPlaying: true,
              });

              if (this.timeoutRef) {
                clearTimeout(this.timeoutRef);
                this.timeoutRef = null;
              }
            })
            .catch((err) => {
              console.error("Error playing video:", err);
              
              onStateChange({
                permissionState: "granted", // We got permission, just can't auto-play
                errorMessage: "Could not play camera stream. Try clicking on the page.",
                isVideoPlaying: false,
              });

              if (this.timeoutRef) {
                clearTimeout(this.timeoutRef);
                this.timeoutRef = null;
              }
            });
        }
      } catch (playError) {
        console.error("Error playing video:", playError);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);

      let errorMessage = "An unknown error occurred when trying to access the camera.";
      let permissionState: CameraPermissionState = "denied";

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          permissionState = "denied";
          errorMessage = "Camera access was denied. Please allow camera permissions to use this feature.";
        } else if (err.name === "NotFoundError") {
          permissionState = "unavailable";
          errorMessage = "Selected camera not found or disconnected.";
        } else if (err.name === "NotReadableError" || err.name === "AbortError") {
          permissionState = "denied";
          errorMessage = "Could not access your camera. It may be in use by another application.";
        } else if (err.name === "OverconstrainedError") {
          // The requested quality is too high for this camera, try again with lower settings
          console.warn("Camera doesn't support requested quality, trying lower quality");

          const fallbackConstraints = {
            video: {
              ...(selectedCamera ? { deviceId: { exact: selectedCamera } } : {}),
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          };

          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              videoRef.current.play().then(() => {
                onStateChange({
                  permissionState: "granted",
                  errorMessage: null,
                  isVideoPlaying: true,
                });
                
                if (this.timeoutRef) {
                  clearTimeout(this.timeoutRef);
                  this.timeoutRef = null;
                }
              });
            }
            return;
          } catch (fallbackErr) {
            console.error("Fallback camera access also failed:", fallbackErr);
          }

          permissionState = "denied";
          errorMessage = "Your camera doesn't support the requested quality settings.";
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      }

      onStateChange({
        permissionState,
        errorMessage,
        isVideoPlaying: false,
      });

      if (this.timeoutRef) {
        clearTimeout(this.timeoutRef);
        this.timeoutRef = null;
      }
    }
  }

  /**
   * Force play the video stream
   */
  forcePlay(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    onStateChange: (update: Partial<CameraServiceState>) => void
  ): void {
    if (!videoRef.current) {
      console.error("Video element not found when trying to force play");
      
      onStateChange({
        permissionState: "denied",
        errorMessage: "Video element not found. Please try refreshing the page.",
      });
      return;
    }

    if (videoRef.current.srcObject) {
      console.log("Force play attempt");
      videoRef.current
        .play()
        .then(() => {
          console.log("Force play successful");
          
          onStateChange({
            isVideoPlaying: true,
            permissionState: "granted",
          });
        })
        .catch((err) => {
          console.error("Force play failed:", err);
        });
    }
  }

  /**
   * Stop any active camera streams
   */
  stopCamera(videoRef: React.RefObject<HTMLVideoElement | null>): void {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }

  /**
   * Toggle fullscreen mode for the video container
   */
  async toggleFullscreen(
    containerRef: React.RefObject<HTMLDivElement | null>,
    // We use onStateChange elsewhere, but the fullscreen state is updated through event handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onStateChange: (update: Partial<CameraServiceState>) => void
  ): Promise<void> {
    try {
      if (!document.fullscreenElement) {
        // If not in fullscreen mode, request it
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        // If in fullscreen mode, exit it
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  }

  /**
   * Handle fullscreen change events
   */
  handleFullscreenChange(
    onStateChange: (update: Partial<CameraServiceState>) => void
  ): void {
    onStateChange({
      isFullscreen: !!document.fullscreenElement,
    });
  }
}

// Export a singleton instance of the camera service
export const cameraService = new CameraService();