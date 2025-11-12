"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import CarsInGarage from "./CarsInGarage";
import ProfileCard from "./ProfileCard";
import SettingsMenu from "./SettingsMenu";

export type UserRole = "admin" | "owner" | "client";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  // Admin & Owner Features
  { label: "Clients", href: "/dashboard/clients", icon: "�", roles: ["admin", "owner"] },
  { label: "Cars in Garage", href: "/dashboard/cars", icon: "🚗", roles: ["admin", "owner"] },
  { label: "Work Orders", href: "/dashboard/repair-sessions", icon: "📋", roles: ["admin", "owner"] },
  { label: "Appointments", href: "/dashboard/appointments", icon: "📅", roles: ["admin", "owner"] },
  { label: "Inspections", href: "/dashboard/inspections", icon: "✓", roles: ["admin", "owner"] },
  { label: "Employees", href: "/dashboard/employees", icon: "�", roles: ["admin", "owner"] },
  { label: "Inventory", href: "/dashboard/inventory", icon: "📦", roles: ["admin", "owner"] },
  { label: "Offers", href: "/dashboard/offers", icon: "$", roles: ["admin", "owner"] },
  { label: "Financial", href: "/dashboard/financial", icon: "$", roles: ["admin", "owner"] },
  { label: "Notifications", href: "/dashboard/notifications", icon: "!", roles: ["admin", "owner"] },
  { label: "Garages", href: "/dashboard/garages", icon: "▢", roles: ["admin"] },
  { label: "Users", href: "/dashboard/users", icon: "👤", roles: ["admin"] },
  { label: "System Logs", href: "/dashboard/logs", icon: "📋", roles: ["admin"] },
  
  // Client Features
  { label: "My Cars", href: "/dashboard/my-cars", icon: "🚗", roles: ["client"] },
  { label: "Service History", href: "/dashboard/service-history", icon: "�", roles: ["client"] },
  { label: "My Appointments", href: "/dashboard/appointments", icon: "📅", roles: ["client"] },
  { label: "Reminders", href: "/dashboard/reminders", icon: "🔔", roles: ["client"] },
  { label: "My Offers", href: "/dashboard/offers", icon: "$", roles: ["client"] },
  { label: "Profile", href: "/dashboard/profile", icon: "👤", roles: ["client"] },
];

interface SidebarProps {
  userRole: UserRole;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    // Clear tokens
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    router.push("/auth/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div className="fixed inset-0 z-30 bg-black/5 lg:hidden" onClick={() => setIsCollapsed(true)} />
      )}

      {/* Sidebar - Apple Style */}
      <aside
        className={`fixed left-0 top-0 h-screen z-40 bg-white transition-all duration-300 ease-out ${
          isCollapsed ? "w-20" : "w-64"
        } lg:relative lg:z-auto overflow-y-auto border-r border-gray-200 flex flex-col pt-20`}
      >
        {/* Header with Logo and Toggle */}
        <div className="absolute top-0 left-0 right-0 h-20 border-b border-gray-200 flex items-center px-4 justify-between bg-white">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <img
                src="/images/logo/gixat-logo.png"
                alt="GIXAT Logo"
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">GIXAT</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isCollapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <div className="space-y-0.5">
            {filteredNavItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-out group ${
                    isActive(item.href)
                      ? "bg-black text-white font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  title={isCollapsed ? item.label : ""}
                >
                  <span className={`text-lg flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive(item.href) ? "scale-110" : ""
                  }`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm font-500 truncate">{item.label}</span>
                  )}
                </Link>
              </div>
            ))}
          </div>
        </nav>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Profile Card - Fetches from GraphQL */}
        <div className="p-3">
          <ProfileCard isCollapsed={isCollapsed} />
        </div>

        {/* Settings Menu */}
        <div className="px-2 pb-3">
          <SettingsMenu isCollapsed={isCollapsed} />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Logout Button */}
        <div className="p-3">
          <button
            onClick={handleLogout}
            className={`w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center gap-3 ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <span className="text-lg flex-shrink-0"></span>
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
