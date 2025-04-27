"use client";

import React from "react";
import { Bell, Settings } from "lucide-react";

interface UserHeaderProps {
  title?: string;
}

export default function UserHeader({ title = "App" }: UserHeaderProps) {
  return (
    <header className="h-16 bg-[#121212] border-b border-slate-800 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Settings */}
        <button className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <Settings size={20} className="text-slate-300" />
        </button>

        <button className="relative p-2 rounded-full hover:bg-slate-800 transition-colors">
          <Bell size={20} className="text-slate-300" />
          <span className="absolute top-1 left-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-[#121212]"></span>
        </button>
      </div>
    </header>
  );
}
