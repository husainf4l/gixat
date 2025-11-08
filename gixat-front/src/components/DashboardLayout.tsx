"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import type { UserRole } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userType: string;
  userName: string;
  onLogout: () => void;
  title: string;
  subtitle: string;
}

/**
 * Centralized DashboardLayout component
 * Provides consistent structure for all dashboard pages
 * - Fixed sidebar navigation
 * - Sticky top navigation bar
 * - Responsive design with proper spacing
 * - Accessible and keyboard-friendly
 */
export default function DashboardLayout({
  children,
  userRole,
  userType,
  userName,
  onLogout,
  title,
  subtitle,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar - Fixed left navigation */}
      <Sidebar userRole={userRole} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full">
        {/* Top Navigation Bar - Sticky header with shadow */}
        <nav 
          className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center shadow-sm"
          role="navigation"
          aria-label="Dashboard navigation"
        >
          {/* Left: Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {subtitle}
            </p>
          </div>

          {/* Right: User Type Badge and Logout Button */}
          <div className="flex items-center gap-2 sm:gap-4 ml-4 flex-shrink-0">
            <span 
              className="hidden sm:inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap"
              role="status"
              aria-label={`User type: ${userType}`}
            >
              {userType}
            </span>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition duration-200 text-sm sm:text-base whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Logout from dashboard"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Max-width container for content with consistent padding */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
            {/* Footer spacing for proper scrolling experience */}
            <div className="mt-8 pb-4" />
          </div>
        </div>
      </main>
    </div>
  );
}
