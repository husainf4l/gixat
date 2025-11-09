"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { User } from "@/lib/auth.types";
import DashboardLayout from "@/components/DashboardLayout";

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = storage.getUser();
    const accessToken = storage.getAccessToken();

    if (!storedUser || !accessToken) {
      router.push("/auth/login");
      return;
    }

    // Ensure this is a BUSINESS user
    if (storedUser.type !== "BUSINESS") {
      // Redirect to appropriate dashboard based on user type
      if (storedUser.type === "CLIENT") {
        router.push("/user-dashboard");
      } else {
        router.push("/auth/login");
      }
      return;
    }

    setUser(storedUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    storage.clearAuth();
    router.push("/auth/login");
  };

  if (loading) {
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
    <DashboardLayout
      userRole="owner"
      userType={user.type}
      userName={user.name}
      onLogout={handleLogout}
      title="Business Dashboard"
      subtitle={`Welcome back, ${user.name}`}
    >
      <div></div>
    </DashboardLayout>
  );
}
