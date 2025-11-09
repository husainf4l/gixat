"use client";

import { useState } from "react";
import { graphqlRequest } from "@/lib/graphql-client";
import { storage } from "@/lib/storage";

interface AddCarToClientProps {
  clientId: string;
  clientName: string;
  onCarAdded?: (car: any) => void;
  onClose?: () => void;
}

interface CarFormData {
  licensePlate: string;
  make: string;
  model: string;
  year: string;
  color: string;
  mileage: string;
  vin: string;
}

export default function AddCarToClient({
  clientId,
  clientName,
  onCarAdded,
  onClose,
}: AddCarToClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CarFormData>({
    licensePlate: "",
    make: "",
    model: "",
    year: new Date().getFullYear().toString(),
    color: "",
    mileage: "0",
    vin: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = storage.getAccessToken();
      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      // Create car via GraphQL mutation
      const response = await graphqlRequest<{ createCar: any }>(
        `mutation($input: CreateCarInput!) {
          createCar(input: $input) {
            id
            licensePlate
            make
            model
            year
            color
            mileage
            vin
            clientId
            createdAt
          }
        }`,
        {
          input: {
            licensePlate: formData.licensePlate,
            make: formData.make,
            model: formData.model,
            year: parseInt(formData.year),
            color: formData.color || null,
            mileage: formData.mileage ? parseInt(formData.mileage) : 0,
            vin: formData.vin || null,
            clientId: clientId,
          },
        },
        token
      );

      if (response.data?.createCar) {
        const newCar = response.data.createCar;
        if (onCarAdded) {
          onCarAdded(newCar);
        }
        // Reset form
        setFormData({
          licensePlate: "",
          make: "",
          model: "",
          year: new Date().getFullYear().toString(),
          color: "",
          mileage: "0",
          vin: "",
        });
        alert("Car added successfully!");
        if (onClose) {
          onClose();
        }
      } else if (response.errors) {
        setError(
          `Error: ${response.errors[0]?.message || "Failed to add car"}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while adding the car"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Add Car</h3>
          <p className="text-sm text-gray-600">Add a vehicle for {clientName}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Plate *
            </label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleInputChange}
              required
              placeholder="ABC-1234"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make *
            </label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              required
              placeholder="Toyota"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              required
              placeholder="Camry"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required
              placeholder="2023"
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              placeholder="White"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mileage (km)
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN (Vehicle Identification Number)
            </label>
            <input
              type="text"
              name="vin"
              value={formData.vin}
              onChange={handleInputChange}
              placeholder="1HGBH41JXMN109186"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition font-medium"
          >
            {loading ? "Adding Car..." : "Add Car"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
