"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.022 2c.725 0 1.447.086 2.152.258l.707 1.768c.346.115.68.258.999.425l1.838 -.513c.612.563 1.152 1.204 1.6 1.899l-.861 1.687c.112.352.198.714.257 1.082l1.699.839c-.146.749-.41 1.46-.776 2.116l-1.799 .341c-.2.308-.428.602-.682.878l.692 1.782a9.005 9.005 0 0 1 -2.315 .985l-1.283 -1.398a5.178 5.178 0 0 1 -1.171 0l-1.282 1.398a8.97 8.97 0 0 1 -2.315 -.985l.692 -1.782a5.596 5.596 0 0 1 -.682 -.878l-1.8 -.341a8.991 8.991 0 0 1 -.775 -2.116l1.7 -.839c.058 -.368.144 -.73.257 -1.082l-.862 -1.687a9.005 9.005 0 0 1 1.6 -1.899l1.838.513c.318 -.167.653 -.31.999 -.425l.707 -1.768a9.005 9.005 0 0 1 2.152 -.258z" />
            <path d="M12 8m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
            <path d="M14 12a2 2 0 1 0 -4 0v4a2 2 0 1 0 4 0" />
          </svg>
          Settings
        </h1>

        <div className="space-y-6">
          {/* User profile section */}
          <div className="border-b border-gray-700/50 pb-6">
            <h2 className="text-lg font-medium mb-4">User Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={user?.firstName || ""}
                  disabled
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={user?.lastName || ""}
                  disabled
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role || ""}
                  disabled
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                Contact support to update your profile information
              </p>
            </div>
          </div>

          {/* App preferences section */}
          <div>
            <h2 className="text-lg font-medium mb-4">App Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-gray-400">Use dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-400">
                    Receive in-app notifications
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
