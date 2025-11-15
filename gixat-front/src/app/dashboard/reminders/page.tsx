"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { storage } from "@/lib/storage";

export default function RemindersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = storage.getAccessToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }
    const userData = storage.getUser();
    setUser(userData);
  }, [router]);

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
      title="Service Reminders"
      subtitle="Upcoming service reminders and maintenance notifications"
    >
      <div className="p-6 space-y-6">
        {/* Reminder Type Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
              All Reminders
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 opacity-50 cursor-not-allowed">
              Oil Change
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 opacity-50 cursor-not-allowed">
              Tire Rotation
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 opacity-50 cursor-not-allowed">
              Inspection
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 opacity-50 cursor-not-allowed">
              Other
            </button>
          </div>
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          <EmptyState
            icon=""
            title="No Service Reminders"
            description="You don't have any upcoming service reminders yet. Add a car and set reminders for your maintenance schedule."
            buttonLabel="Set First Reminder"
            onButtonClick={() => {}}
          />
        </div>

        {/* Reminder Card Template (Hidden) */}
        <div className="hidden">
          <div className="bg-white rounded-lg border border-l-4 border-l-orange-500 border-gray-200 p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Oil Change Reminder</h3>
                <p className="text-sm text-gray-600 mt-1">Car: Plate #ABC123</p>
                <p className="text-sm text-gray-600">Due: ___</p>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">Upcoming</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition text-sm font-medium">
                View Garages
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
