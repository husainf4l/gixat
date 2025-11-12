"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { registerUser } from "@/lib/auth.mutations";
import { graphqlRequest } from "@/lib/graphql-client";
import { UserType } from "@/lib/auth.types";
import { storage } from "@/lib/storage";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    type: "CLIENT" as UserType,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        type: formData.type,
      });

      if (response.errors) {
        setError(response.errors[0]?.message || "Registration failed");
        return;
      }

      if (response.data?.register) {
        const { accessToken, refreshToken, user } = response.data.register;

        // Store tokens and user in localStorage
        storage.setAccessToken(accessToken);
        storage.setRefreshToken(refreshToken);
        storage.setUser(user);

        // Redirect based on user type
        if (user.type === "BUSINESS") {
          // For BUSINESS users, redirect to setup garage first
          router.push("/setup-garage");
        } else {
          // For CLIENT type, go to user dashboard
          router.push("/user-dashboard");
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
            alt="Sign up background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="w-80 relative z-10 px-6 ml-[28rem]">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-600 tracking-tight text-black mb-1.5">
            Create account
          </h1>
          <p className="text-sm text-gray-600 font-400">
            Join us and get started
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-500 animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 text-base transition-all duration-200 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
            />
          </div>

          {/* Email field */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 text-base transition-all duration-200 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
            />
          </div>

          {/* Account Type selector */}
          <div className="relative">
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black text-base transition-all duration-200 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '36px',
              }}
            >
              <option value="CLIENT">Client</option>
              <option value="BUSINESS">Business</option>
            </select>
          </div>

          {/* Password field */}
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 text-base transition-all duration-200 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
            />
          </div>

          {/* Confirm Password field */}
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 text-base transition-all duration-200 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
            />
          </div>

          {/* Sign up button */}
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
                Creating account...
              </span>
            ) : (
              "Create account"
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
            Sign up with Apple
          </button>
          <button
            type="button"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black font-500 text-base transition-all duration-200 hover:bg-gray-50"
          >
            Sign up with Google
          </button>
        </div>

        {/* Sign in link */}
        <p className="mt-6 text-center text-gray-600 text-base">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-black font-600 hover:text-gray-700 transition-colors duration-200">
            Sign in
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
