"use client";

import Link from "next/link";

interface SettingsMenuProps {
  isCollapsed: boolean;
}

export default function SettingsMenu({ isCollapsed }: SettingsMenuProps) {
  const settings = [
    { label: "Profile", href: "/dashboard/profile", icon: "👤" },
    { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
    { label: "Notifications", href: "/dashboard/notifications", icon: "🔔" },
  ];

  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {settings.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex justify-center px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            title={item.label}
          >
            <span className="text-lg">{item.icon}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {settings.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-sm truncate">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
