"use client";

import React from "react";
import { usePathname } from "next/navigation";
import UserNavBar from "@/app/layout/app/UserNavBar";
import UserHeader from "@/app/layout/app/UserHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Generate page title from the pathname
  const getPageTitle = (): string => {
    if (pathname === "/app") return "Dashboard";

    const pathSegment = pathname.split("/").pop();
    if (!pathSegment) return "Dashboard";

    return pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);
  };

  return (
    <div className="min-h-screen text-white flex flex-row">
      <UserNavBar />

      <div className="flex flex-col flex-1 min-h-screen w-full">
        <UserHeader title={getPageTitle()} />

        <main className="w-full flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
