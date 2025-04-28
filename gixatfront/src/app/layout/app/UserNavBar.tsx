"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Camera,
  Tv,
  Rss,
  User,
  Settings,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

interface UserNavBarProps {
  orientation: "vertical" | "horizontal";
}

export default function UserNavBar({
  orientation = "vertical",
}: UserNavBarProps) {
  const pathname = usePathname();
  const isHorizontal = orientation === "horizontal";

  const navItems = [
    {
      id: "feed",
      name: "Feed",
      path: "/app",
      icon: <Rss size={isHorizontal ? 24 : 20} />,
    },
    {
      id: "chat",
      name: "Chat",
      path: "/app/chat",
      icon: <MessageSquare size={isHorizontal ? 24 : 20} />,
    },
    {
      id: "clients",
      name: "Clients",
      path: "/app/clients",
      icon: <User size={isHorizontal ? 24 : 20} />,
    },
    {
      id: "settings",
      name: "Settings",
      path: "/app/under",
      icon: <Settings size={isHorizontal ? 24 : 20} />,
    },
  ];

  // Horizontal (mobile) layout
  if (isHorizontal) {
    return (
      <div className="w-full bg-[#121212] border-t border-slate-800 shadow-lg">
        <nav className="py-1">
          <ul className="flex items-center justify-around">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center p-1.5 rounded-md transition-colors",
                    pathname === item.path
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-full",
                      pathname === item.path
                        ? "bg-blue-600"
                        : "hover:bg-slate-800"
                    )}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[10px] mt-0.5 font-medium">
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }

  // Vertical (desktop) layout
  return (
    <>
      <div className="fixed top-0 left-0 h-screen w-16 bg-[#121212] border-r border-slate-800 flex flex-col z-40">
        <div className="px-3 mb-4 mt-4">
          <div className="h-10 w-10 bg-gray-500 rounded-md flex items-center justify-center">
            <User size={18} />
          </div>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-6">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={cn(
                    "flex items-center justify-center px-2 py-2 text-sm rounded-md transition-colors",
                    pathname === item.path
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                  title={item.name}
                >
                  {item.icon}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Spacer div to push content to the right of the fixed navbar */}
      <div className="w-16 flex-shrink-0"></div>
    </>
  );
}
