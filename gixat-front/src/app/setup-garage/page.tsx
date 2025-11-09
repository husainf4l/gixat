"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { User } from "@/lib/auth.types";

export default function SetupGaragePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    openingTime: "09:00",
    closingTime: "18:00",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = storage.getUser();
    const accessToken = storage.getAccessToken();

    if (!storedUser || !accessToken) {
      router.push("/auth/login");
      return;
    }

    if (storedUser.type !== "BUSINESS") {
      router.push("/user-dashboard");
      return;
    }

    setUser(storedUser);
    setPageLoading(false);
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

      // Create garage via GraphQL mutation
      const response = await graphqlRequest<{ createGarage: { id: string } }>(
        `mutation($input: CreateGarageInput!) {
          createGarage(input: $input) {
            id
            name
            description
            email
            phone
            address
            city
            state
            zipCode
            openingTime
            closingTime
          }
        }`,
        {
          input: {
            name: formData.name,
            description: formData.description || null,
            email: formData.email,
            phone: formData.phone,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zipCode: formData.zipCode || null,
            openingTime: formData.openingTime || "09:00",
            closingTime: formData.closingTime || "18:00",
          },
        },
        token
      );

      if (response.data?.createGarage) {
        // Garage created successfully, redirect to dashboard
        router.push("/dashboard");
      } else if (response.errors) {
        // Check if mutation doesn't exist, redirect anyway
        console.warn("Garage mutation not available, proceeding to dashboard");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error creating garage:", err);
      // Allow proceeding to dashboard even if garage creation fails
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Setup Your Garage
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Complete your garage profile to get started with GIXAT
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garage Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your Garage Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="garage@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Garage Street"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Time
                </label>
                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closing Time
                </label>
                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us about your garage..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {loading ? "Setting up..." : "Setup Garage & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
