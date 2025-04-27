import React from "react";
import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#020817]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-gray-900/50 z-10" />
        <Image
          src="/images/bgcover.png"
          alt="Garage background"
          fill
          className="object-cover opacity-50"
          priority
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-20 lg:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-[calc(100vh-80px)]">
          <div className="text-white space-y-6">
            <div className="inline-block px-3 py-1 bg-blue-500/20 rounded-full backdrop-blur-sm border border-blue-400/20 mb-2">
              <span className="text-sm font-medium text-blue-100">
                The Smart Garage Solution
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Revolutionize Your{" "}
              <span className="text-blue-400">Garage Management</span>{" "}
              Experience
            </h1>

            <p className="text-lg md:text-xl text-blue-100 max-w-xl">
              Streamline operations, boost efficiency, and enhance customer
              satisfaction with our intelligent garage management software.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/signup"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition duration-300 text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/app/demo"
                className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg font-medium text-white border border-white/20 transition duration-300 text-center"
              >
                View Demo
              </Link>
            </div>

            <div className="pt-6">
              <p className="text-blue-200 text-sm mb-3">
                Trusted by garage professionals
              </p>
              <div className="flex gap-6 items-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent z-10" />
              <div className="absolute bottom-8 left-8 right-8 z-20 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">
                    Dashboard Overview
                  </h3>
                  <div className="flex space-x-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-blue-100">
                  <div>
                    <p className="text-blue-300">Active Jobs</p>
                    <p className="text-2xl font-bold text-white">24</p>
                  </div>
                  <div>
                    <p className="text-blue-300">Completed Today</p>
                    <p className="text-2xl font-bold text-white">12</p>
                  </div>
                  <div>
                    <p className="text-blue-300">Efficiency</p>
                    <p className="text-2xl font-bold text-white">92%</p>
                  </div>
                </div>
              </div>
              <Image
                src="/images/header-img.jpeg"
                alt="Gixat Dashboard"
                fill
                className="object-cover transform scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020817] to-transparent z-10" />
    </section>
  );
};

export default Hero;
