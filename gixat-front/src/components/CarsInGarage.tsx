"use client";

import { useRouter } from "next/navigation";

interface CarsInGarageProps {
  isCollapsed: boolean;
}

export default function CarsInGarage({ isCollapsed }: CarsInGarageProps) {
  const router = useRouter();

  const handleNavigateToCars = () => {
    router.push("/dashboard/cars");
  };

  return (
    <div className="px-2 py-2">
      {/* Navigation Link */}
      <button
        onClick={handleNavigateToCars}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        title={isCollapsed ? "Cars in Garage" : ""}
      >
        <span className="text-lg flex-shrink-0"></span>
        {!isCollapsed && (
          <span className="text-sm font-medium text-gray-700 flex-1 text-left">
            Cars in Garage
          </span>
        )}
        {!isCollapsed && (
          <svg
            className="w-4 h-4 text-gray-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
