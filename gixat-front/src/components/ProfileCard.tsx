"use client";

import { useEffect, useState } from "react";
import { graphqlRequest } from "@/lib/graphql-client";
import { storage } from "@/lib/storage";
import { GET_ME_QUERY } from "@/lib/dashboard.queries";

interface User {
  id: string;
  email: string;
  type: string;
}

interface ProfileCardProps {
  isCollapsed: boolean;
}

export default function ProfileCard({ isCollapsed }: ProfileCardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = storage.getAccessToken();
        if (!token) {
          setLoading(false);
          setError("Not authenticated");
          return;
        }

        const response = await graphqlRequest(GET_ME_QUERY, {}, token);

        if ((response as any).data?.me) {
          setUser((response as any).data.me);
        } else if ((response as any).errors) {
          const errorMsg = (response as any).errors[0]?.message || "Failed to fetch user";
          setError(errorMsg);
          console.warn("Error fetching user:", errorMsg);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Error fetching profile");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch on client side
    if (typeof window !== "undefined") {
      fetchUser();
    }
  }, []);

  if (loading) {
    return (
      <div className="px-3 py-2 rounded-lg bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
      </div>
    );
  }

  if (error || !user) {
    return null;
  }

  const getRoleIcon = (type: string) => {
    switch (type) {
      case "ADMIN":
        return "👨‍💼";
      case "BUSINESS":
        return "🏢";
      case "OWNER":
        return "👔";
      case "EMPLOYEE":
        return "👨‍🔧";
      case "CLIENT":
        return "👤";
      default:
        return "👤";
    }
  };

  if (isCollapsed) {
    return (
      <div className="px-3 py-2 flex justify-center" title={user.email}>
        <span className="text-lg">{getRoleIcon(user.type)}</span>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{getRoleIcon(user.type)}</span>
        <p className="text-xs font-semibold text-gray-900 truncate">{user.email}</p>
      </div>
      <p className="text-xs text-gray-500 ml-6 truncate">
        {user.type.charAt(0) + user.type.slice(1).toLowerCase()}
      </p>
    </div>
  );
}
