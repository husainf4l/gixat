"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/app");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    // Validate password strength (optional)
    if (password.length < 6) {
      setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }

    setIsLoading(true);

    try {
      await register(firstName, lastName, email, password);
      router.push("/app"); // Redirect to app after successful registration
    } catch (err: unknown) {
      console.error("Signup error:", err);
      setError(
        (err as Error)?.message ||
          "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-b from-[#0F1118] to-[#1A1D2B] min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-gradient-to-r from-gray-900 to-[#1A1D2B] rounded-xl shadow-2xl p-8">
              <h1 className="text-3xl font-bold text-white mb-6 text-center">
                إنشاء <span className="text-cyan-400">حساب جديد</span>
              </h1>

              {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-gray-300 mb-2"
                    >
                      الاسم الأول
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-[#1E2235] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="الاسم الأول"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-gray-300 mb-2"
                    >
                      الاسم الأخير
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#1E2235] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="الاسم الأخير"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-300 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1E2235] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="example@upthouse.com"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="block text-gray-300 mb-2"
                  >
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#1E2235] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-gray-300 mb-2"
                  >
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#1E2235] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      جاري التحميل...
                    </span>
                  ) : (
                    "إنشاء الحساب"
                  )}
                </button>

                <div className="mt-6 text-center">
                  <p className="text-gray-400">
                    لديك حساب بالفعل؟{" "}
                    <Link
                      href="/login"
                      className="text-cyan-400 hover:underline"
                    >
                      تسجيل الدخول
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
