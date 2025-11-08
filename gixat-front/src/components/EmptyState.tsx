"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export default function EmptyState({
  icon = "📭",
  title,
  description,
  buttonLabel,
  onButtonClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm">{description}</p>
      {buttonLabel && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
}
