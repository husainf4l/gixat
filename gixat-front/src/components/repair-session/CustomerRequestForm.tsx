"use client";

// Customer Request Form - DEPRECATED
// This mutation is not available in the backend GraphQL schema.
// Use Job Card or Inspection forms instead.

interface CustomerRequestFormProps {
  repairSessionId: string;
  onSuccess?: () => void;
}

export default function CustomerRequestForm({ repairSessionId, onSuccess }: CustomerRequestFormProps) {
  return (
    <div className="p-4 border border-yellow-300 rounded-lg bg-yellow-50">
      <p className="text-yellow-700 font-medium">
        ⚠️ Customer Request feature is not available in the backend.
      </p>
      <p className="text-yellow-600 text-sm mt-2">
        Please use the Job Card or Inspection forms to record repair-related information.
      </p>
    </div>
  );
}
