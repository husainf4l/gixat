"use client";

interface StatsCardProps {
  label: string;
  icon?: string;
  isLoading?: boolean;
}

export default function StatsCard({ label, icon = "📊", isLoading = false }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-xs text-gray-500 mt-4">Loading data...</p>
    </div>
  );
}
