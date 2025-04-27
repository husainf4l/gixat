"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clientService } from "../../../../services/client/api";

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    carModel: "",
    plateNumber: "",
    color: "",
    mileage: "",
    year: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Format the data exactly as required for the API
      const clientData = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        carModel: formData.carModel,
        plateNumber: formData.plateNumber,
        color: formData.color,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
      };

      await clientService.createClient(clientData);
      router.push("/app/clients");
    } catch (err) {
      console.error("Failed to create client:", err);
      setError("Failed to create client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 px-1 md:px-0 pb-16 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <h1 className="text-xl md:text-2xl font-bold">Add New Client</h1>
        <Link href="/app/clients">
          <button className="w-full md:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm">
            Cancel
          </button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 text-sm md:text-base md:px-4 md:py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <div className="space-y-1 md:space-y-2">
            <label htmlFor="name" className="block text-sm md:text-base">
              Client Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <label
              htmlFor="mobileNumber"
              className="block text-sm md:text-base"
            >
              Mobile Number <span className="text-red-400">*</span>
            </label>
            <input
              id="mobileNumber"
              name="mobileNumber"
              type="text"
              required
              value={formData.mobileNumber}
              onChange={handleChange}
              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <label htmlFor="carModel" className="block text-sm md:text-base">
              Car Model
            </label>
            <input
              id="carModel"
              name="carModel"
              type="text"
              value={formData.carModel}
              onChange={handleChange}
              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <label htmlFor="plateNumber" className="block text-sm md:text-base">
              Plate Number
            </label>
            <input
              id="plateNumber"
              name="plateNumber"
              type="text"
              value={formData.plateNumber}
              onChange={handleChange}
              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <label htmlFor="color" className="block text-sm md:text-base">
              Color
            </label>
            <input
              id="color"
              name="color"
              type="text"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <label htmlFor="year" className="block text-sm md:text-base">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <label htmlFor="mileage" className="block text-sm md:text-base">
              Mileage
            </label>
            <input
              id="mileage"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleChange}
              className="w-full px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base bg-gray-800 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 md:pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-4 py-2 md:px-6 md:py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-700 rounded-md flex items-center justify-center md:justify-start space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Client</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
