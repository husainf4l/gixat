"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { sessionService, Session } from "../../../../../services/session/api";

export default function InspectionPage() {
  const { id } = useParams();
  const router = useRouter();
  const sessionId = id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ notes: "", status: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      try {
        const data = await sessionService.getSessionById(sessionId);
        setSession(data);
        setError("");
      } catch (err) {
        setError("Failed to load session.");
      } finally {
        setLoading(false);
      }
    }
    if (sessionId) fetchSession();
  }, [sessionId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      // Replace with your actual API call to create inspection
      await sessionService.createInspection(sessionId, form);
      router.refresh();
    } catch (err) {
      setSubmitError("Failed to create inspection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !session)
    return (
      <div className="p-8 text-center text-red-400">
        {error || "Session not found."}
      </div>
    );

  // Update the return statement to handle inspection properly
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Link
        href={`/app/sessions/${sessionId}`}
        className="text-blue-400 hover:underline"
      >
        Back to Session
      </Link>
      <h1 className="text-2xl font-bold mb-4">Session Inspection</h1>
      {session.inspection && typeof session.inspection === "object" ? (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-2">Inspection Details</h2>
          <div>
            <b>Status:</b> {session.inspection.status || "N/A"}
          </div>
          <div>
            <b>Notes:</b> {session.inspection.notes || "N/A"}
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4"
        >
          <h2 className="text-lg font-semibold mb-2">Create Inspection</h2>
          <div>
            <label className="block mb-1">Status</label>
            <input
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700"
              rows={4}
              required
            />
          </div>
          {submitError && <div className="text-red-400">{submitError}</div>}
          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 rounded text-white"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Create Inspection"}
          </button>
        </form>
      )}
    </div>
  );
}
