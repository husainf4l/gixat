"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { GET_ME_QUERY } from "@/lib/dashboard.queries";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  type: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true); // Changed to true by default
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = storage.getAccessToken();
        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Try to fetch from GraphQL
        const response = await graphqlRequest(GET_ME_QUERY, {}, token);
        
        if ((response as any).data?.me) {
          const userData = (response as any).data.me;
          setUser(userData);
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
          });
        } else {
          // Fallback to localStorage
          const storedUser = storage.getUser();
          if (storedUser) {
            setUser(storedUser);
            setFormData({
              name: storedUser.firstName || "",
              email: storedUser.email || "",
              phone: storedUser.phone || "",
              address: storedUser.address || "",
              city: storedUser.city || "",
              state: storedUser.state || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // Fallback to localStorage
        const storedUser = storage.getUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Save to localStorage for now
    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        ...formData,
      };
      storage.setUser(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
      alert("Profile updated successfully!");
    }
  };

  const handleCancel = () => {
    // Reset form
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  return (
    <DashboardLayout
      userName={user?.name || formData.name || "User"}
      userRole={(user?.type as any) || "CLIENT"}
      userType={(user?.type as any) || "CLIENT"}
      onLogout={handleLogout}
      title="My Profile"
      subtitle="View and edit your profile information"
    >
      <div className="p-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
              {formData.name?.charAt(0) || "U"}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{formData.name || "User Name"}</h2>
              <p className="text-gray-600">{formData.email || "user@example.com"}</p>
              <p className="text-sm text-gray-500 mt-2">{user?.type || "Client"} Account</p>
            </div>
          </div>

          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium disabled:opacity-50" disabled>
            Change Avatar
          </button>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 (000) 000-0000"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                placeholder="Street address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
              <input
                type="text"
                name="state"
                placeholder="State/Province"
                value={formData.state}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
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

        {/* Contact Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input type="checkbox" id="email-notif" className="w-4 h-4 rounded" defaultChecked />
              <label htmlFor="email-notif" className="ml-3 text-sm text-gray-700">
                Receive email notifications about service updates
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="sms-notif" className="w-4 h-4 rounded" defaultChecked />
              <label htmlFor="sms-notif" className="ml-3 text-sm text-gray-700">
                Receive SMS reminders for upcoming services
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="news-notif" className="w-4 h-4 rounded" />
              <label htmlFor="news-notif" className="ml-3 text-sm text-gray-700">
                Subscribe to newsletters and promotions
              </label>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
