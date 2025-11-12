"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
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
              myGarages: Array<{ id: string; name: string }> 
            }>(
              `query {
                myGarages {
                  id
                  name
                }
              }`,
              {},
              accessToken
            );

            if (garageResponse.data?.myGarages && garageResponse.data.myGarages.length > 0) {
              // Garage exists, go to dashboard
              router.push("/dashboard");
            } else if (garageResponse.errors && garageResponse.errors[0]?.message === "Unauthorized") {
              // Token is unauthorized, redirect back to login
              storage.clearAuth();
              setError("Session expired. Please login again.");
              return;
            } else {
              // No garage or error, go to setup
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
    <>
      <Navbar />
      <div className="h-[calc(100vh-80px)] flex items-center justify-start bg-white relative overflow-hidden">
        {/* Background gradient (subtle) */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white pointer-events-none" />
        
        {/* Background Image */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image
            src="/images/logo/signin.webp"
            alt="Sign in background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="w-80 relative z-10 px-6 ml-[28rem]">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-600 tracking-tight text-black mb-1.5">
              Sign in
            </h1>
            <p className="text-sm text-gray-600 font-400">
              to your account
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-500 animate-pulse">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 text-base transition-all duration-200 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 text-base transition-all duration-200 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
              />
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white font-600 py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] mt-4 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Additional options */}
          <div className="space-y-2.5">
            <button
              type="button"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black font-500 text-base transition-all duration-200 hover:bg-gray-50"
            >
              Continue with Apple
            </button>
            <button
              type="button"
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black font-500 text-base transition-all duration-200 hover:bg-gray-50"
            >
              Continue with Google
            </button>
          </div>

          {/* Sign up link */}
          <p className="mt-6 text-center text-gray-600 text-base">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-black font-600 hover:text-gray-700 transition-colors duration-200">
              Create one
            </Link>
          </p>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Privacy Policy · Terms of Service
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
