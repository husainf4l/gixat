"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  userRole: string;
  userName?: string;
  userEmail?: string;
}

export default function Header({ userRole, userName = "User", userEmail = "user@example.com" }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    router.push("/auth/login");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "owner":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left Side - Title */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Garage Management System</h2>
          <p className="text-sm text-gray-500">Welcome back to GIXAT</p>
        </div>

        {/* Right Side - User Info & Actions */}
        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleColor(userRole)}`}>
            {userRole}
          </span>

          {/* User Profile Dropdown */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition"
              title="Logout"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
