"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { graphqlRequest } from "@/lib/graphql-client";
import { storage } from "@/lib/storage";
import AddCarToClient from "./AddCarToClient";
import AddRepairSession from "./AddRepairSession";

interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  vin?: string;
  status?: string;
  createdAt?: string;
}

interface ClientDetailsProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  onClose?: () => void;
}

export default function ClientDetails({
  clientId,
  clientName,
  clientEmail,
  clientPhone,
  onClose,
}: ClientDetailsProps) {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCar, setShowAddCar] = useState(false);
  const [showRepairSession, setShowRepairSession] = useState(false);
  const [selectedCarForRepair, setSelectedCarForRepair] = useState<Car | null>(null);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClientCars();
  }, [clientId]);

  const fetchClientCars = async () => {
    try {
      const token = storage.getAccessToken();
      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      // Fetch cars for this client
      const response = await graphqlRequest<{ carsByClient: Car[] }>(
        `query($clientId: ID!) {
          carsByClient(clientId: $clientId) {
            id
            licensePlate
            make
            model
            year
            color
            mileage
            vin
            status
            createdAt
          }
        }`,
        { clientId },
        token
      );

      if (response.data?.carsByClient) {
        setCars(response.data.carsByClient);
      } else {
        setCars([]);
      }
    } catch (err) {
      console.error("Error fetching client cars:", err);
      setError("Failed to load vehicles");
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCarAdded = (newCar: Car) => {
    setCars((prev) => [newCar, ...prev]);
    setShowAddCar(false);
  };

  const handleOpenRepairSession = (car: Car) => {
    setSelectedCarForRepair(car);
    setShowRepairSession(true);
  };

  const handleCloseRepairSession = () => {
    setShowRepairSession(false);
    setSelectedCarForRepair(null);
  };

  const handleEditCar = (car: Car) => {
    setEditingCarId(car.id);
    setEditingCar({ ...car });
  };

  const handleUpdateCar = async () => {
    if (!editingCar) return;

    try {
      const token = storage.getAccessToken();
      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      const response = await graphqlRequest<{ updateCar: Car }>(
        `mutation($id: ID!, $input: UpdateCarInput!) {
          updateCar(id: $id, input: $input) {
            id
            licensePlate
            make
            model
            year
            color
            mileage
            vin
            status
            createdAt
          }
        }`,
        {
          id: editingCar.id,
          input: {
            licensePlate: editingCar.licensePlate,
            make: editingCar.make,
            model: editingCar.model,
            year: editingCar.year,
            color: editingCar.color,
            mileage: editingCar.mileage,
            vin: editingCar.vin,
            status: editingCar.status,
          },
        },
        token
      );

      if (response.data?.updateCar) {
        setCars((prev) =>
          prev.map((c) => (c.id === editingCar.id ? (response.data?.updateCar as Car) : c))
        );
        setEditingCarId(null);
        setEditingCar(null);
        setError("");
      }
    } catch (err) {
      console.error("Error updating car:", err);
      setError("Failed to update vehicle");
    }
  };

  const handleCancelEdit = () => {
    setEditingCarId(null);
    setEditingCar(null);
  };

  return (
    <div className="space-y-6">
      {/* Client Info Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{clientName}</h2>
            <p className="text-gray-600 mt-1">Client Details</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/clients/${clientId}/repair-sessions`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
            >
               View All Repair Sessions
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-base font-medium text-gray-900">{clientEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="text-base font-medium text-gray-900">{clientPhone}</p>
          </div>
        </div>
      </div>

      {/* Add Car Form */}
      {showAddCar && (
        <AddCarToClient
          clientId={clientId}
          clientName={clientName}
          onCarAdded={handleCarAdded}
          onClose={() => setShowAddCar(false)}
        />
      )}

      {/* Add Repair Session Form */}
      {showRepairSession && selectedCarForRepair && (
        <AddRepairSession
          carId={selectedCarForRepair.id}
          carName={`${selectedCarForRepair.make} ${selectedCarForRepair.model} (${selectedCarForRepair.licensePlate})`}
          onSessionAdded={() => {
            handleCloseRepairSession();
          }}
          onClose={handleCloseRepairSession}
        />
      )}

      {/* Vehicles Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Vehicles</h3>
            <p className="text-sm text-gray-600">
              {cars.length} vehicle{cars.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button
            onClick={() => setShowAddCar(!showAddCar)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            {showAddCar ? " Cancel" : " Add Vehicle"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading vehicles...</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-3">No vehicles registered yet</p>
            {!showAddCar && (
              <button
                onClick={() => setShowAddCar(true)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
              >
                Register First Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {cars.map((car) => (
              <div key={car.id}>
                {editingCarId === car.id && editingCar ? (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
                    <h4 className="font-semibold text-gray-900 mb-4">Edit Vehicle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Make
                        </label>
                        <input
                          type="text"
                          value={editingCar.make}
                          onChange={(e) =>
                            setEditingCar({ ...editingCar, make: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Model
                        </label>
                        <input
                          type="text"
                          value={editingCar.model}
                          onChange={(e) =>
                            setEditingCar({ ...editingCar, model: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          License Plate
                        </label>
                        <input
                          type="text"
                          value={editingCar.licensePlate}
                          onChange={(e) =>
                            setEditingCar({ ...editingCar, licensePlate: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <input
                          type="number"
                          value={editingCar.year}
                          onChange={(e) =>
                            setEditingCar({ ...editingCar, year: parseInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          value={editingCar.color || ""}
                          onChange={(e) =>
                            setEditingCar({ ...editingCar, color: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mileage (km)
                        </label>
                        <input
                          type="number"
                          value={editingCar.mileage || ""}
                          onChange={(e) =>
                            setEditingCar({ ...editingCar, mileage: parseInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          VIN
                        </label>
                        <input
                          type="text"
                          value={editingCar.vin || ""}
                          onChange={(e) =>
                            setEditingCar({ ...editingCar, vin: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={editingCar.status || "AVAILABLE"}
                          onChange={(e) =>
                            setEditingCar({ ...editingCar, status: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="IN_SERVICE">In Service</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateCar}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {car.make} {car.model}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {car.year}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        License Plate: <span className="font-medium">{car.licensePlate}</span>
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-600">
                        {car.color && <span>{car.color}</span>}
                        {car.mileage !== undefined && (
                          <span>{car.mileage.toLocaleString()} km</span>
                        )}
                        {car.vin && <span>VIN: {car.vin}</span>}
                      </div>
                      {car.status && (
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                            car.status === "AVAILABLE"
                              ? "bg-green-100 text-green-700"
                              : car.status === "IN_SERVICE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {car.status}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex flex-col gap-2">
                      <p className="text-xs text-gray-500">
                        Added {car.createdAt ? new Date(car.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditCar(car)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenRepairSession(car)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition"
                        >
                          Repair Session
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
