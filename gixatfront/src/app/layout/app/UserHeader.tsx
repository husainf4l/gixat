"use client";

import React from "react";
import { Bell, Settings, Search } from "lucide-react";

interface UserHeaderProps {
  title?: string;
}

export default function UserHeader({ title = "App" }: UserHeaderProps) {
  return (
    <header className="h-14 md:h-16 w-full bg-[#121212] flex items-center justify-between pl-0 pr-3 md:px-6">
      {/* Page title */}
      <h1 className="text-base md:text-xl font-semibold truncate max-w-[150px] md:max-w-none">
        {title}
      </h1>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search - shown on all screens */}
        <button className="p-1.5 md:p-2 rounded-full hover:bg-slate-800 transition-colors">
          <Search size={18} className="text-slate-300" />
        </button>

        {/* Settings - hidden on small screens */}
        <button className="hidden md:block p-2 rounded-full hover:bg-slate-800 transition-colors">
          <Settings size={20} className="text-slate-300" />
        </button>

        {/* Notifications */}
        <button className="relative p-1.5 md:p-2 rounded-full hover:bg-slate-800 transition-colors">
          <Bell size={18} className="text-slate-300" />
          <span className="absolute top-1 left-1 h-2 w-2 md:h-2.5 md:w-2.5 bg-red-500 rounded-full ring-1 md:ring-2 ring-[#121212]"></span>
        </button>
      </div>
    </header>
  );
}
