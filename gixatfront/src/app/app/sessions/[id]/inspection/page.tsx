"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { sessionService, Session } from "../../../../../services/session/api";

// Define the inspection interfaces based on your schema
interface InspectionImage {
  id: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  notes?: string;
}

interface Inspection {
  id: string;
  notes?: string;
  checklist?: ChecklistItem[];
  testDriveNotes?: string;
  createdAt: string;
  updatedAt: string;
  sessionId: string;
  images: InspectionImage[];
}

// Default checklist items for new inspections
const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "1", name: "Exterior Body", checked: false },
  { id: "2", name: "Lights", checked: false },
  { id: "3", name: "Tires", checked: false },
  { id: "4", name: "Brakes", checked: false },
  { id: "5", name: "Suspension", checked: false },
  { id: "6", name: "Engine", checked: false },
  { id: "7", name: "Transmission", checked: false },
  { id: "8", name: "Interior", checked: false },
  { id: "9", name: "Electronics", checked: false },
  { id: "10", name: "Air Conditioning", checked: false },
];

export default function InspectionPage() {
  const router = useRouter();
  const { id } = useParams();
  const sessionId = id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form state
  const [notes, setNotes] = useState("");
  const [testDriveNotes, setTestDriveNotes] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [images, setImages] = useState<InspectionImage[]>([]);

  // UI states
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageDescription, setImageDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Add this function to handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const fetchSessionAndInspection = async () => {
      setLoading(true);
      try {
        // Fetch session data
        const sessionData = await sessionService.getSessionById(sessionId);
        setSession(sessionData);

        // Check if inspection exists in the session response
        if (sessionData.inspection) {
          const inspectionData = sessionData.inspection;
          setInspection(inspectionData);
          setNotes(inspectionData.notes || "");
          setTestDriveNotes(inspectionData.testDriveNotes || "");

          // Handle the case where checklist is an empty object instead of an array
          if (
            Array.isArray(inspectionData.checklist) &&
            inspectionData.checklist.length > 0
          ) {
            setChecklist(inspectionData.checklist);
          } else {
            setChecklist(DEFAULT_CHECKLIST_ITEMS);
          }

          // Handle the case where images might not exist
          setImages(inspectionData.images || []);
          setIsNew(false);
        } else {
          // Try to fetch inspection separately if it's not in the session
          try {
            const inspectionData = await sessionService.getInspection(
              sessionId
            );
            if (inspectionData) {
              setInspection(inspectionData);
              setNotes(inspectionData.notes || "");
              setTestDriveNotes(inspectionData.testDriveNotes || "");

              // Handle the case where checklist is an empty object instead of an array
              if (
                Array.isArray(inspectionData.checklist) &&
                inspectionData.checklist.length > 0
              ) {
                setChecklist(inspectionData.checklist);
              } else {
                setChecklist(DEFAULT_CHECKLIST_ITEMS);
              }

              // Handle the case where images might not exist
              setImages(inspectionData.images || []);
              setIsNew(false);
            } else {
              throw new Error("No inspection found");
            }
          } catch (err) {
            // No inspection exists yet
            console.log("No existing inspection found, creating new one");
            setInspection(null);
            setNotes("");
            setTestDriveNotes("");
            setChecklist(DEFAULT_CHECKLIST_ITEMS);
            setImages([]);
            setIsNew(true);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionAndInspection();
    }
  }, [sessionId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const inspectionData = {
        sessionId,
        notes,
        testDriveNotes,
        checklist,
        // images will be handled separately through file uploads
      };

      let result;
      if (isNew) {
        result = await sessionService.createInspection(inspectionData);
      } else if (inspection?.id) {
        // Update using inspection ID if available
        result = await sessionService.updateInspection(
          inspection.id,
          inspectionData
        );
      } else {
        // Fall back to session ID if inspection ID is not available
        result = await sessionService.updateInspection(
          sessionId,
          inspectionData
        );
      }

      setInspection(result);
      setIsNew(false);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving inspection:", err);
      setSaveError("Failed to save inspection. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedFile || !inspection?.id) return;

    setUploadingImage(true);
    try {
      // Use inspection ID for the image upload
      const uploadedImage = await sessionService.uploadInspectionImage(
        inspection.id,
        selectedFile,
        imageDescription
      );

      setImages((prev) => [...prev, uploadedImage]);
      setSelectedFile(null);
      setImageDescription("");
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    try {
      await sessionService.deleteInspectionImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-1 md:px-0 pb-16 md:pb-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white text-sm md:text-base group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5 mr-1 group-hover:-translate-x-0.5 transition-transform"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Session
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
        <div className="flex gap-4 items-start md:items-center">
          <div className="bg-blue-500/20 rounded-md p-3 text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 21h-10a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h18a3 3 0 0 1 3 3v7" />
              <path d="M3 9l18 0" />
              <path d="M15 17l2 2l4 -4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              Vehicle Inspection
            </h1>
            {session && (
              <div className="text-gray-400 text-sm flex items-center gap-1">
                <span>Session:</span>
                <span className="text-gray-300 font-mono">
                  {session.id.slice(0, 8)}
                </span>
                {session.car && (
                  <span className="text-gray-300 ml-2">
                    - {session.car.make} {session.car.model} {session.car.year}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
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
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Inspection
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback messages */}
      {saveSuccess && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-lg">
          Inspection saved successfully!
        </div>
      )}
      {saveError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg">
          {saveError}
        </div>
      )}

      {/* Integrated Form Content */}
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 md:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Inspection Notes */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
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
                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                <path d="M9 9l1 0" />
                <path d="M9 13l6 0" />
                <path d="M9 17l6 0" />
              </svg>
              General Notes
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Inspection Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-md p-3 text-sm"
                rows={4}
                placeholder="Enter general inspection notes here..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Test Drive Notes
              </label>
              <textarea
                value={testDriveNotes}
                onChange={(e) => setTestDriveNotes(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-md p-3 text-sm"
                rows={4}
                placeholder="Enter test drive observations and findings..."
              ></textarea>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4 border-t border-gray-700/30 pt-6">
            <h2 className="text-lg font-medium flex items-center gap-2">
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Inspection Images
            </h2>

            {/* Image upload form */}
            <div className="flex flex-col md:flex-row gap-4 bg-gray-700/30 p-4 rounded-lg">
              <div className="flex-grow space-y-3">
                <div>
                  <label className="block text-sm mb-1">Select Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full text-sm bg-gray-700/50 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={imageDescription}
                    onChange={(e) => setImageDescription(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-md p-2 text-sm"
                    placeholder="Describe what this image shows..."
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={!selectedFile || uploadingImage}
                  className={`px-4 py-2 h-10 rounded-md text-sm flex items-center gap-2 ${
                    !selectedFile
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {uploadingImage ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
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
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                        <path d="M16 5V3" />
                        <path d="M8 17l4-4" />
                        <path d="M19 5l-4.5 4.5" />
                        <path d="M16 3h6v6" />
                      </svg>
                      Upload Image
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Image gallery */}
            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="border border-gray-700/50 rounded-lg overflow-hidden"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.description || "Inspection image"}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                        {image.description || "No description provided"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
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
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 bg-gray-700/20 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 mx-auto mb-2 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p>No inspection images yet</p>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-4 border-t border-gray-700/30 pt-6">
            <h2 className="text-lg font-medium flex items-center gap-2">
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
                <path d="M9 11l3 3l8 -8" />
                <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
              </svg>
              Inspection Checklist
            </h2>

            <p className="text-sm text-gray-400">
              Check all items that have been inspected and add notes where
              needed.
            </p>
          </div>

          {/* Bottom save button */}
          <div className="mt-8 pt-6 border-t border-gray-700/30 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save Inspection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
