import React, { useState, useRef } from "react";

interface SessionFormProps {
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function SessionForm({
  onClose,
  onSubmit,
  isSubmitting,
}: SessionFormProps) {
  const [notes, setNotes] = useState("");
  const [sessionImages, setSessionImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg md:text-xl font-bold">Create New Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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

        <div className="space-y-4">
          {/* Customer notes */}
          <div>
            <label
              htmlFor="customerNotes"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Customer Notes
            </label>
            <textarea
              id="customerNotes"
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-sm placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter client's concerns or additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Upload Images
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg">
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
                <div className="flex text-sm text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none"
                  >
                    <span className="px-2">Upload images</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files) {
                          const filesArray = Array.from(e.target.files);
                          setSessionImages(filesArray);
                        }
                      }}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            {/* Preview uploaded images */}
            {sessionImages.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-300 mb-2">
                  {sessionImages.length} image(s) selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {sessionImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 text-white"
                        onClick={() => {
                          const newImages = [...sessionImages];
                          newImages.splice(index, 1);
                          setSessionImages(newImages);
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
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`px-3 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              "Create Session"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
