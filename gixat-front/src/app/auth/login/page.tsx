"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth.mutations";
import { graphqlRequest } from "@/lib/graphql-client";
import { storage } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        email,
        password,
      });

      if (response.errors) {
        setError(response.errors[0]?.message || "Login failed");
        return;
      }

      if (response.data?.login) {
        const { accessToken, refreshToken, user } = response.data.login;

        // Store tokens and user in localStorage
        storage.setAccessToken(accessToken);
        storage.setRefreshToken(refreshToken);
        storage.setUser(user);

        // Redirect based on user type
        if (user.type === "BUSINESS") {
          // For BUSINESS users, check if they have a garage setup
          try {
            const garageResponse = await graphqlRequest<{ 
              garages: Array<{ id: string; name: string }> 
            }>(
              `query {
                garages {
                  id
                  name
                }
              }`,
              {},
              accessToken
            );

            if (garageResponse.data?.garages && garageResponse.data.garages.length > 0) {
              // Garage exists, go to dashboard
              router.push("/dashboard");
            } else {
              // No garage, go to setup
              router.push("/setup-garage");
            }
          } catch (err) {
            console.error("Error checking garage:", err);
            // Default to setup garage on error
            router.push("/setup-garage");
          }
        } else if (user.type === "CLIENT") {
          router.push("/user-dashboard");
        } else {
          // Default to dashboard for SYSTEM or unknown types
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Sign in to your account
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
