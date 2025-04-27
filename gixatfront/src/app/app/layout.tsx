"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import UserNavBar from "@/app/layout/app/UserNavBar";
import UserHeader from "@/app/layout/app/UserHeader";
import { Menu, X } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Generate page title from the pathname
  const getPageTitle = (): string => {
    if (pathname === "/app") return "Dashboard";

    const pathSegment = pathname.split("/").pop();
    if (!pathSegment) return "Dashboard";

    return pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);
  };

  // Toggle mobile navigation
  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  // Close mobile navigation when clicking on content area (for better UX)
  const closeMobileNav = () => {
    if (isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col md:flex-row relative">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <UserNavBar orientation="vertical" />
      </div>

      {/* Mobile sidebar overlay - only visible when menu is open */}
      <div
        className={`fixed inset-0 bg-black/70 z-30 transition-opacity duration-300 md:hidden ${
          isMobileNavOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobileNav}
      />

      {/* Mobile sidebar - slides in from left */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#121212] border-r border-slate-800 z-40 transform transition-transform duration-300 ease-out md:hidden ${
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold">Menu</h2>
          <button
            onClick={toggleMobileNav}
            className="p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={24} className="text-slate-300" />
          </button>
        </div>
        <div className="p-4">
          <NavLinks onNavigate={closeMobileNav} />
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-screen w-full">
        {/* Header - visible on all screens with menu button on mobile */}
        <div className="border-b border-slate-800 bg-[#121212]">
          <div className="flex items-center">
            <button
              onClick={toggleMobileNav}
              className="md:hidden p-3.5 text-slate-300 hover:text-white"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <UserHeader title={getPageTitle()} />
          </div>
        </div>

        {/* Main content - full width without bottom nav padding */}
        <main className="w-full flex-1 p-4 md:p-6" onClick={closeMobileNav}>
          {children}
        </main>
      </div>
    </div>
  );
}

// NavLinks component to reuse the same links in both desktop and mobile
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", name: "Dashboard", path: "/app" },
    { id: "chat", name: "Chat", path: "/app/chat" },
    { id: "clients", name: "Clients", path: "/app/clients" },
    { id: "settings", name: "Settings", path: "/app/under" },
  ];

  return (
    <ul className="space-y-2">
      {navItems.map((item) => (
        <li key={item.id}>
          <a
            href={item.path}
            className={`block px-4 py-3 rounded-md transition-colors ${
              pathname === item.path
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            onClick={onNavigate}
          >
            {item.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
