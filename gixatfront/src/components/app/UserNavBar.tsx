"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Camera, Tv, Rss, User, Settings, AlertTriangle } from "lucide-react";

export default function UserNavBar() {
  const pathname = usePathname();

  const navItems = [
    { id: "feed", name: "Feed", path: "/app", icon: <Rss size={20} /> },
    {
      id: "settings",
      name: "Settings",
      path: "/app/settings",
      icon: <Settings size={20} />,
    },
    { id: "live", name: "Live", path: "/app/live", icon: <Tv size={20} /> },

    {
      id: "challange",
      name: "Challange",
      path: "/app/challange",

      //error icon
      icon: <AlertTriangle size={20} />,
    },
    {
      id: "camera",
      name: "Camera",
      path: "/app/camera",
      icon: <Camera size={20} />,
    },
  ];

  return (
    <div className="h-screen w-16 bg-[#121212] border-l border-slate-800 flex flex-col fixed top-0 right-0 z-40">
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
      {/* Footer section removed as it's not needed in icon-only mode */}
    </div>
  );
}
