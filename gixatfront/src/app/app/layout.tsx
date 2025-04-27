"use client";

import React from "react";
import { usePathname } from "next/navigation";
import UserNavBar from "@/components/app/UserNavBar";
import UserHeader from "@/components/app/UserHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Generate page title from the pathname
  const getPageTitle = (): string => {
    if (pathname === "/app") return "App";

    const pathSegment = pathname.split("/").pop();
    if (!pathSegment) return "App";

    return pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);
  };

  return (
    <div className="flex h-screen text-white">
      <div className="flex-1 flex flex-col overflow-hidden mr-16">
        {/* User Header */}
        <UserHeader title={getPageTitle()} />

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-[#0a0a0a] p-6">
          {children}
        </main>
      </div>

      <UserNavBar />
    </div>
  );
}
