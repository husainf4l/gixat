"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { storage } from "@/lib/storage";
import { graphqlRequest } from "@/lib/graphql-client";
import { GET_ME_QUERY, UPDATE_PROFILE_MUTATION } from "@/lib/dashboard.queries";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "security">("general");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    garageName: "",
    address: "",
    city: "",
    state: "",
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
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    newsletter: false,
  });
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const defaultBusinessHours = {
    Monday: { start: "", end: "" },
    Tuesday: { start: "", end: "" },
    Wednesday: { start: "", end: "" },
    Thursday: { start: "", end: "" },
    Friday: { start: "", end: "" },
    Saturday: { start: "", end: "" },
    Sunday: { start: "", end: "" },
  };

  useEffect(() => {
    const token = storage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    // Fetch from GraphQL to get all profile data including businessHours
    graphqlRequest(GET_ME_QUERY, {}, token)
      .then((response: any) => {
        if (response.data?.me) {
          const userData = response.data.me;
          setUser(userData);

          // Map GraphQL businessHours format to form format
          const businessHours = userData.businessHours
            ? {
                Monday: userData.businessHours.monday || { start: "", end: "" },
                Tuesday: userData.businessHours.tuesday || { start: "", end: "" },
                Wednesday: userData.businessHours.wednesday || { start: "", end: "" },
                Thursday: userData.businessHours.thursday || { start: "", end: "" },
                Friday: userData.businessHours.friday || { start: "", end: "" },
                Saturday: userData.businessHours.saturday || { start: "", end: "" },
                Sunday: userData.businessHours.sunday || { start: "", end: "" },
              }
            : defaultBusinessHours;

          setFormData((prev) => ({
            ...prev,
            fullName: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            city: userData.city || "",
            state: userData.state || "",
            garageName: userData.garageName || "",
            zipCode: userData.zipCode || "",
            businessHours,
          }));
        } else {
          // Fallback to localStorage if GraphQL fails
          const userData = storage.getUser();
          setUser(userData);
          if (userData) {
            setFormData((prev) => ({
              ...prev,
              fullName: userData.firstName || "",
              email: userData.email || "",
              phone: userData.phone || "",
              address: userData.address || "",
              city: userData.city || "",
              state: userData.state || "",
              garageName: userData.garageName || "",
              zipCode: userData.zipCode || "",
              businessHours: defaultBusinessHours,
            }));
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        // Fallback to localStorage
        const userData = storage.getUser();
        setUser(userData);
      });
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
    // Validate form data
    if (!formData.fullName || !formData.email) {
      alert("❌ Please fill in required fields (Full Name and Email)");
      return;
    }

    const token = storage.getAccessToken();
    if (!token) {
      alert("❌ Not authenticated. Please login again.");
      return;
    }

    try {
      // Map form businessHours to GraphQL format
      const businessHoursInput = {
        monday: formData.businessHours.Monday,
        tuesday: formData.businessHours.Tuesday,
        wednesday: formData.businessHours.Wednesday,
        thursday: formData.businessHours.Thursday,
        friday: formData.businessHours.Friday,
        saturday: formData.businessHours.Saturday,
        sunday: formData.businessHours.Sunday,
      };

      // Call the updateProfile mutation with input object
      graphqlRequest(
        UPDATE_PROFILE_MUTATION,
        {
          input: {
            name: formData.fullName,
            phone: formData.phone || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            businessHours: businessHoursInput,
          },
        },
        token
      ).then((response: any) => {
        if (response.data?.updateProfile) {
          const updatedUser = response.data.updateProfile;
          setUser(updatedUser);

          // Map updated businessHours back to form format
          const businessHours = updatedUser.businessHours
            ? {
                Monday: updatedUser.businessHours.monday || { start: "", end: "" },
                Tuesday: updatedUser.businessHours.tuesday || { start: "", end: "" },
                Wednesday: updatedUser.businessHours.wednesday || { start: "", end: "" },
                Thursday: updatedUser.businessHours.thursday || { start: "", end: "" },
                Friday: updatedUser.businessHours.friday || { start: "", end: "" },
                Saturday: updatedUser.businessHours.saturday || { start: "", end: "" },
                Sunday: updatedUser.businessHours.sunday || { start: "", end: "" },
              }
            : formData.businessHours;

          setFormData((prev) => ({
            ...prev,
            fullName: updatedUser.name || "",
            email: updatedUser.email || "",
            phone: updatedUser.phone || "",
            address: updatedUser.address || "",
            city: updatedUser.city || "",
            state: updatedUser.state || "",
            garageName: prev.garageName,
            zipCode: prev.zipCode,
            businessHours,
          }));
          
          // Store both backend data and local fields
          const userToStore = {
            ...updatedUser,
            garageName: formData.garageName,
            zipCode: formData.zipCode,
          };
          storage.setUser(userToStore);
          alert("✅ Account information updated successfully!");
        } else if (response.errors) {
          alert(`❌ Error: ${response.errors[0]?.message || "Failed to update account"}`);
        }
      }).catch((error: any) => {
        console.error("Error updating account:", error);
        alert("❌ Failed to save account information. Please try again.");
      });
    } catch (error) {
      console.error("Error in handleSave:", error);
      alert("❌ Failed to save account information. Please try again.");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.firstName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        garageName: user.garageName || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
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

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationPreferences((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveNotifications = () => {
    try {
      const updatedUser = {
        ...user,
        notificationPreferences,
      };
      storage.setUser(updatedUser);
      setUser(updatedUser);
      alert("✅ Notification preferences updated successfully!");
    } catch (error) {
      console.error("Error saving notifications:", error);
      alert("❌ Failed to save notification preferences. Please try again.");
    }
  };

  const handleSaveSecurity = () => {
    if (!securityData.currentPassword) {
      alert("Please enter your current password");
      return;
    }
    if (!securityData.newPassword || !securityData.confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (securityData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long");
      return;
    }

    try {
      // Store the new password locally for demonstration
      // In a production app, this would call a backend API endpoint
      const updatedUser = {
        ...user,
        localPassword: securityData.newPassword,
      };
      storage.setUser(updatedUser);
      setUser(updatedUser);
      
      alert("✅ Password updated successfully!\n\nℹ️ Note: This is a local change for demonstration. In production, password changes should be handled by the backend API.\n\nYour new password has been saved locally. Next time you login, you can use your new password.");
      
      // Clear the form
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      alert("❌ Failed to update password. Please try again.");
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
              <button
                onClick={() => setActiveTab("general")}
                className={`px-4 py-3 border-b-2 font-medium transition ${
                  activeTab === "general"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-700 hover:text-gray-900"
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-4 py-3 border-b-2 font-medium transition ${
                  activeTab === "notifications"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-700 hover:text-gray-900"
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-4 py-3 border-b-2 font-medium transition ${
                  activeTab === "security"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-700 hover:text-gray-900"
                }`}
              >
                Security
              </button>
            </div>
          </div>

          {/* Tab Content Container */}
          <div className="p-6 space-y-6">
            {activeTab === "general" && (
              <>
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
              </>
            )}

            {activeTab === "notifications" && (
              <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      name="emailNotifications"
                      checked={notificationPreferences.emailNotifications}
                      onChange={handleNotificationChange}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="emailNotifications" className="ml-3 text-sm text-gray-700">
                      Receive email notifications about service updates
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      name="smsNotifications"
                      checked={notificationPreferences.smsNotifications}
                      onChange={handleNotificationChange}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="smsNotifications" className="ml-3 text-sm text-gray-700">
                      Receive SMS reminders for upcoming services
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      checked={notificationPreferences.newsletter}
                      onChange={handleNotificationChange}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="newsletter" className="ml-3 text-sm text-gray-700">
                      Subscribe to newsletters and promotions
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleSaveNotifications}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  💾 Save Preferences
                </button>
              </div>
              </>
            )}

            {activeTab === "security" && (
              <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Enter your current password"
                      value={securityData.currentPassword}
                      onChange={handleSecurityChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      value={securityData.newPassword}
                      onChange={handleSecurityChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={securityData.confirmPassword}
                      onChange={handleSecurityChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleSaveSecurity}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  🔒 Update Password
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
