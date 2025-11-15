"use client";

import { useState } from "react";
import { graphqlRequest } from "@/lib/graphql-client";
import { storage } from "@/lib/storage";
import { User } from "@/lib/auth.types";

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
  fuelType: string;
  transmission: string;
  engineSize: string;
  mileage: string;
  vin: string;
  registrationDate: string;
  insuranceCompany: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  notes: string;
}

const CAR_MAKES = [
  "TOYOTA", "HONDA", "FORD", "CHEVROLET", "NISSAN", "BMW", "MERCEDES", "AUDI",
  "VOLKSWAGEN", "HYUNDAI", "KIA", "MAZDA", "SUBARU", "LEXUS", "ACURA", "INFINITI",
  "CADILLAC", "BUICK", "GMC", "JEEP", "DODGE", "CHRYSLER", "RAM", "LINCOLN",
  "VOLVO", "JAGUAR", "LAND_ROVER", "PORSCHE", "TESLA", "OTHER"
];

const CAR_COLORS = [
  "BLACK", "WHITE", "SILVER", "GRAY", "RED", "BLUE", "GREEN", "YELLOW",
  "ORANGE", "BROWN", "PURPLE", "GOLD", "BEIGE", "OTHER"
];

const FUEL_TYPES = ["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC", "PLUG_IN_HYBRID", "CNG", "LPG"];
const TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "CVT", "SEMI_AUTOMATIC"];

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
    make: "TOYOTA",
    model: "",
    year: new Date().getFullYear().toString(),
    color: "WHITE",
    fuelType: "GASOLINE",
    transmission: "AUTOMATIC",
    engineSize: "",
    mileage: "0",
    vin: "",
    registrationDate: "",
    insuranceCompany: "",
    insurancePolicyNumber: "",
    insuranceExpiryDate: "",
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        setLoading(false);
        return;
      }

      const user = storage.getUser();
      if (!user) {
        setError("User information not found.");
        setLoading(false);
        return;
      }

      // Frontend validation
      if (!formData.licensePlate.trim()) {
        setError("License plate is required.");
        setLoading(false);
        return;
      }

      if (!formData.make.trim()) {
        setError("Car make is required.");
        setLoading(false);
        return;
      }

      if (!formData.model.trim()) {
        setError("Car model is required.");
        setLoading(false);
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
            fuelType
            transmission
            engineSize
            mileage
            vin
            registrationDate
            insuranceCompany
            insurancePolicyNumber
            insuranceExpiryDate
            notes
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
            color: formData.color,
            fuelType: formData.fuelType,
            transmission: formData.transmission,
            engineSize: formData.engineSize ? parseFloat(formData.engineSize) : null,
            mileage: formData.mileage ? parseInt(formData.mileage) : 0,
            vin: formData.vin || null,
            registrationDate: formData.registrationDate || null,
            insuranceCompany: formData.insuranceCompany || null,
            insurancePolicyNumber: formData.insurancePolicyNumber || null,
            insuranceExpiryDate: formData.insuranceExpiryDate || null,
            notes: formData.notes || null,
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
          make: "TOYOTA",
          model: "",
          year: new Date().getFullYear().toString(),
          color: "WHITE",
          fuelType: "GASOLINE",
          transmission: "AUTOMATIC",
          engineSize: "",
          mileage: "0",
          vin: "",
          registrationDate: "",
          insuranceCompany: "",
          insurancePolicyNumber: "",
          insuranceExpiryDate: "",
          notes: "",
        });
        alert("Car added successfully!");
        if (onClose) {
          onClose();
        }
      } else if (response.errors) {
        const errorMessage = response.errors[0]?.message || "Failed to add car";
        
        // Handle specific constraint violations
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint")) {
          if (errorMessage.includes("licensePlate") || errorMessage.includes("license_plate")) {
            userFriendlyMessage = "This license plate is already registered. Please enter a different license plate.";
          } else if (errorMessage.includes("vin")) {
            userFriendlyMessage = "This VIN (Vehicle Identification Number) is already registered. Please enter a different VIN or leave it empty.";
          } else if (errorMessage.includes("insurancePolicyNumber") || errorMessage.includes("insurance_policy")) {
            userFriendlyMessage = "This insurance policy number is already registered. Please enter a different policy number or leave it empty.";
          } else {
            userFriendlyMessage = "A car with these details already exists. Please check the license plate, VIN, or insurance policy number and try again.";
          }
        }
        
        setError(`Error: ${userFriendlyMessage}`);
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
          {/* License Plate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Plate * <span className="text-xs text-gray-500">(Must be unique)</span>
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

          {/* Make */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make *
            </label>
            <select
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CAR_MAKES.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
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

          {/* Year */}
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

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color *
            </label>
            <select
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CAR_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type *
            </label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FUEL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmission *
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TRANSMISSIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Engine Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engine Size (L)
            </label>
            <input
              type="number"
              step="0.1"
              name="engineSize"
              value={formData.engineSize}
              onChange={handleInputChange}
              placeholder="2.0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mileage */}
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

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN <span className="text-xs text-gray-500">(Must be unique, optional)</span>
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

          {/* Registration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Date
            </label>
            <input
              type="date"
              name="registrationDate"
              value={formData.registrationDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Insurance Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Company
            </label>
            <input
              type="text"
              name="insuranceCompany"
              value={formData.insuranceCompany}
              onChange={handleInputChange}
              placeholder="Company Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Insurance Policy Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Policy Number <span className="text-xs text-gray-500">(Must be unique, optional)</span>
            </label>
            <input
              type="text"
              name="insurancePolicyNumber"
              value={formData.insurancePolicyNumber}
              onChange={handleInputChange}
              placeholder="POL-12345"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Insurance Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Insurance Expiry Date
            </label>
            <input
              type="date"
              name="insuranceExpiryDate"
              value={formData.insuranceExpiryDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes about the vehicle..."
              rows={3}
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
