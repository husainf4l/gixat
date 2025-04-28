// SessionEntryForm component for media inputs
import React, { useState, useRef, useContext } from "react";
import { sessionService } from "../../services/session/api";
import { AuthContext } from "../../context/AuthContext";

type SessionEntryFormProps = {
  sessionId: string;
  onEntryCreated: () => void;
};

// Map the UI entry types to API entry types
const entryTypeMap = {
  text: "TEXT",
  image: "IMAGE",
  voice: "VOICE",
  note: "NOTE",
} as const;

type UIEntryType = "text" | "image" | "voice" | "note";

const SessionEntryForm: React.FC<SessionEntryFormProps> = ({
  sessionId,
  onEntryCreated,
}) => {
  const { user } = useContext(AuthContext);
  const [entryText, setEntryText] = useState("");
  const [entryImages, setEntryImages] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<UIEntryType>("text");
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEntryText(e.target.value);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setEntryImages(filesArray);
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mpeg",
        });
        setRecordedAudio(audioBlob);

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      });

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setFeedback({
        message: "Could not access microphone. Please check permissions.",
        type: "error",
      });
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Format recording time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Reset the audio recording
  const resetRecording = () => {
    setRecordedAudio(null);
    setRecordingTime(0);
  };

  // Submit the entry
  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate based on active tab
    if (
      (activeTab === "text" && !entryText.trim()) ||
      (activeTab === "image" && entryImages.length === 0) ||
      (activeTab === "voice" && !recordedAudio) ||
      (activeTab === "note" && !entryText.trim())
    ) {
      setFeedback({
        message: "Please add content before submitting",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    // Check if user is logged in
    if (!user || !user.id) {
      setFeedback({
        message: "You need to be logged in to submit entries",
        type: "error",
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      let entryResponse;

      // For text and note types
      if (activeTab === "text" || activeTab === "note") {
        entryResponse = await sessionService.createEntry(sessionId, {
          type: entryTypeMap[activeTab],
          originalMessage: entryText,
          createdById: user.id,
        });
      }
      // For image type
      else if (activeTab === "image" && entryImages.length > 0) {
        // First upload the images
        const formData = new FormData();
        entryImages.forEach((image, index) => {
          formData.append(`image`, image);
        });

        // Upload files first to get URLs
        const uploadResponse = await sessionService.uploadEntryFiles(
          sessionId,
          formData
        );

        if (!uploadResponse || !uploadResponse.photoUrl) {
          throw new Error("Failed to upload image");
        }

        // Then create the entry with the image URL
        entryResponse = await sessionService.createMixedMediaEntry(sessionId, {
          text: "", // Empty text for image-only entry
          photoUrl: uploadResponse.photoUrl,
          createdById: user.id,
        });
      }
      // For voice recording
      else if (activeTab === "voice" && recordedAudio) {
        const formData = new FormData();
        formData.append("audio", recordedAudio, "recording.mp3");

        // Upload voice file first
        const uploadResponse = await sessionService.uploadEntryFiles(
          sessionId,
          formData
        );

        if (!uploadResponse || !uploadResponse.audioUrl) {
          throw new Error("Failed to upload audio");
        }

        // Then create entry with the audio URL
        entryResponse = await sessionService.createMixedMediaEntry(sessionId, {
          text: "", // Empty text for voice-only entry
          audioUrl: uploadResponse.audioUrl,
          createdById: user.id,
        });
      }

      console.log("Entry created successfully:", entryResponse);

      // Reset form after successful submission
      setEntryText("");
      setEntryImages([]);
      setRecordedAudio(null);
      setRecordingTime(0);

      setFeedback({
        message: "Entry added successfully!",
        type: "success",
      });

      // Notify parent component to refresh entries
      onEntryCreated();

      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error("Error submitting entry:", error);
      setFeedback({
        message: "Failed to add entry. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          <path d="M8 10h8" />
          <path d="M8 14h4" />
          <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
        </svg>
        Add Session Entry
      </h2>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-700/50 mb-4">
        <button
          onClick={() => setActiveTab("text")}
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === "text"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <div className="flex items-center gap-1.5">
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
              <path d="M19 20h-10a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v8" />
              <path d="M11 13h-4" />
              <path d="M11 9h-6" />
              <path d="M11 17h-8" />
              <path d="M15 16l4 4" />
              <path d="M15 20l4 -4" />
            </svg>
            Text
          </div>
        </button>
        <button
          onClick={() => setActiveTab("image")}
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === "image"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <div className="flex items-center gap-1.5">
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
              <path d="M15 8h.01" />
              <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
              <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
              <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
            </svg>
            Images
          </div>
        </button>
        <button
          onClick={() => setActiveTab("voice")}
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === "voice"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <div className="flex items-center gap-1.5">
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
              <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
              <path d="M12 19c-4.286 0 -7.5 -3.5 -7.5 -7.5v-4a7.5 7.5 0 0 1 15 0v4c0 4 -3.214 7.5 -7.5 7.5z" />
              <path d="M5 9v-2a7 7 0 0 1 14 0v2" />
              <path d="M8 17c0 1 0 3 4 3s4 -2 4 -3" />
            </svg>
            Voice
          </div>
        </button>
        <button
          onClick={() => setActiveTab("note")}
          className={`py-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === "note"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <div className="flex items-center gap-1.5">
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
              <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18" />
              <path d="M13 8l2 0" />
              <path d="M13 12l2 0" />
            </svg>
            Note
          </div>
        </button>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`mb-4 p-3 rounded-md ${
            feedback.type === "success"
              ? "bg-green-800/70 border border-green-700"
              : "bg-red-800/70 border border-red-700"
          }`}
        >
          <p
            className={`text-sm ${
              feedback.type === "success" ? "text-green-200" : "text-red-200"
            }`}
          >
            {feedback.message}
          </p>
        </div>
      )}

      {/* Text Input */}
      {(activeTab === "text" || activeTab === "note") && (
        <div className="mb-4">
          <textarea
            rows={5}
            placeholder={
              activeTab === "text"
                ? "Enter text message..."
                : "Add a note about this session..."
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-sm placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            value={entryText}
            onChange={handleTextChange}
          ></textarea>
        </div>
      )}

      {/* Image Upload */}
      {activeTab === "image" && (
        <div className="mb-4">
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-400 justify-center">
                <label className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none">
                  <span>Upload images</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {/* Preview images */}
          {entryImages.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-300 mb-2">
                {entryImages.length} image(s) selected
              </p>
              <div className="flex flex-wrap gap-2">
                {entryImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newImages = [...entryImages];
                        newImages.splice(index, 1);
                        setEntryImages(newImages);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice Recording */}
      {activeTab === "voice" && (
        <div className="mb-4">
          <div className="flex flex-col items-center justify-center bg-gray-700 border border-gray-600 rounded-lg p-8">
            {!recordedAudio ? (
              <>
                {isRecording ? (
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 mb-2 relative">
                      <div className="absolute w-10 h-10 bg-red-500 rounded-full animate-ping opacity-50"></div>
                      <div className="relative w-4 h-4 bg-red-500 rounded-full"></div>
                    </div>
                    <p className="text-gray-300 text-xl font-mono mt-2">
                      {formatTime(recordingTime)}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Recording...</p>
                  </div>
                ) : (
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-600 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M12 19c-4.286 0 -7.5 -3.5 -7.5 -7.5v-4a7.5 7.5 0 0 1 15 0v4c0 4 -3.214 7.5 -7.5 7.5z" />
                        <path d="M5 9v-2a7 7 0 0 1 14 0v2" />
                        <path d="M8 17c0 1 0 3 4 3s4 -2 4 -3" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Press the button to start recording
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white flex items-center gap-2"
                    >
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
                        <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2z" />
                      </svg>
                      Stop Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white flex items-center gap-2"
                    >
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
                      Start Recording
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12.998v-6a3 3 0 0 0 -3 -3h-14a3 3 0 0 0 -3 3v6a3 3 0 0 0 3 3h9" />
                      <path d="M10 9l5 3l-5 3z" />
                      <path d="M15 15l4 4" />
                      <path d="M15 19l4 -4" />
                    </svg>
                  </div>
                  <p className="text-gray-300 font-medium">
                    Recording Complete
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Duration: {formatTime(recordingTime)}
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={resetRecording}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"
                  >
                    Record Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium flex items-center gap-2 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
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
                <path d="M5 12l5 5l10 -10" />
              </svg>
              Submit Entry
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SessionEntryForm;
