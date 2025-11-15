"use client";

// Test Drive Form - DEPRECATED
// This mutation is not available in the backend GraphQL schema.
// Use Job Card or Inspection forms instead.

interface TestDriveFormProps {
  repairSessionId: string;
  onSuccess?: () => void;
}

export default function TestDriveForm({ repairSessionId, onSuccess }: TestDriveFormProps) {
  return (
    <div className="p-4 border border-yellow-300 rounded-lg bg-yellow-50">
      <p className="text-yellow-700 font-medium">
         Test Drive feature is not available in the backend.
      </p>
      <p className="text-yellow-600 text-sm mt-2">
        Please use the Job Card or Inspection forms to record repair-related information.
      </p>
    </div>
  );
}
