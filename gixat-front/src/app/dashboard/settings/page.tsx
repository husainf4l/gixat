"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { storage } from "@/lib/storage";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    garageName: "",
    address: "",
    city: "",
    zipCode: "",
    businessHours: {
      Monday: { start: "", end: "" },
      Tuesday: { start: "", end: "" },
      Wednesday: { start: "", end: "" },
      Thursday: { start: "", end: "" },
      Friday: { start: "", end: "" },
      Saturday: { start: "", end: "" },
      Sunday: { start: "", end: "" },
    },
  });

  useEffect(() => {
    const token = storage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    const userData = storage.getUser();
    setUser(userData);
    if (userData) {
      setFormData({
        fullName: userData.firstName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        garageName: userData.garageName || "",
        address: userData.address || "",
        city: userData.city || "",
        zipCode: userData.zipCode || "",
        businessHours: {
          Monday: { start: "", end: "" },
          Tuesday: { start: "", end: "" },
          Wednesday: { start: "", end: "" },
          Thursday: { start: "", end: "" },
          Friday: { start: "", end: "" },
          Saturday: { start: "", end: "" },
          Sunday: { start: "", end: "" },
        },
      });
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBusinessHourChange = (
    day: string,
    type: "start" | "end",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [type]: value,
        },
      },
    }));
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      firstName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      garageName: formData.garageName,
      address: formData.address,
      city: formData.city,
      zipCode: formData.zipCode,
    };
    storage.setUser(updatedUser);
    setUser(updatedUser);
    alert("Settings updated successfully!");
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.firstName || "",
        email: user.email || "",
        phone: user.phone || "",
        garageName: user.garageName || "",
        address: user.address || "",
        city: user.city || "",
        zipCode: user.zipCode || "",
        businessHours: {
          Monday: { start: "", end: "" },
          Tuesday: { start: "", end: "" },
          Wednesday: { start: "", end: "" },
          Thursday: { start: "", end: "" },
          Friday: { start: "", end: "" },
          Saturday: { start: "", end: "" },
          Sunday: { start: "", end: "" },
        },
      });
    }
  };

  if (!user) return null;

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  return (
    <DashboardLayout
      userName={user?.firstName || "User"}
      userRole={user?.role || "CLIENT"}
      userType={user?.userType || "CLIENT"}
      onLogout={handleLogout}
      title="Settings"
      subtitle="Manage your account and system settings"
    >
      <div className="p-6 space-y-6">
        {/* Settings Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button className="px-4 py-3 border-b-2 border-blue-600 text-blue-600 font-medium">
                General
              </button>
              <button className="px-4 py-3 border-b-2 border-transparent text-gray-700 hover:text-gray-900 opacity-50 cursor-not-allowed">
                Notifications
              </button>
              <button className="px-4 py-3 border-b-2 border-transparent text-gray-700 hover:text-gray-900 opacity-50 cursor-not-allowed">
                Security
              </button>
            </div>
          </div>

          {/* General Settings */}
          <div className="p-6 space-y-6">
            {/* Account Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (000) 000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Garage Settings (for Owner) */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Garage Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Garage Name</label>
                  <input
                    type="text"
                    name="garageName"
                    placeholder="Your garage name"
                    value={formData.garageName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Garage address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="Zip code"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-gray-700">{day}</span>
                    <input
                      type="time"
                      value={formData.businessHours[day as keyof typeof formData.businessHours].start}
                      onChange={(e) => handleBusinessHourChange(day, "start", e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={formData.businessHours[day as keyof typeof formData.businessHours].end}
                      onChange={(e) => handleBusinessHourChange(day, "end", e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                💾 Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
