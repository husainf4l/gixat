"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// Dashboard feature card component
const FeatureCard = ({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}) => {
  return (
    <Link
      href={href}
      className={`block p-6 transition-all duration-300 ${color} rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-5px] border border-gray-700/50`}
    >
      <div className="flex items-center mb-3">
        <div className="mr-3 p-2 bg-black/20 rounded-lg">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
    </Link>
  );
};

export default function AppPage() {
  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome to Gixat Dashboard
        </h1>
        <p className="text-blue-100">
          Manage and explore your Gixat services from this central hub.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50 flex items-center justify-between shadow-md">
          <div>
            <p className="text-gray-400 text-sm">Active Clients</p>
            <h3 className="text-2xl font-bold text-white">24</h3>
          </div>
          <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50 flex items-center justify-between shadow-md">
          <div>
            <p className="text-gray-400 text-sm">Total Sessions</p>
            <h3 className="text-2xl font-bold text-white">189</h3>
          </div>
          <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700/50 flex items-center justify-between shadow-md">
          <div>
            <p className="text-gray-400 text-sm">Completion Rate</p>
            <h3 className="text-2xl font-bold text-white">86%</h3>
          </div>
          <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="AI Assistant"
          description="Access your AI assistant for tasks, information, and real-time support."
          icon={
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          href="/app/chat"
          color="bg-gradient-to-br from-blue-900/70 to-blue-700/70"
        />

        <FeatureCard
          title="Client Management"
          description="View, add, and manage your client list with detailed profiles and history."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          href="/app/clients"
          color="bg-gradient-to-br from-indigo-900/70 to-indigo-700/70"
        />

        <FeatureCard
          title="Camera & Recognition"
          description="Use our advanced camera recognition tools for identification and verification."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-emerald-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          href="/app/under"
          color="bg-gradient-to-br from-emerald-900/70 to-emerald-700/70"
        />

        <FeatureCard
          title="Analytics Dashboard"
          description="Visualize your data with comprehensive analytics and reporting tools."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-amber-300"
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
          }
          href="/app/under"
          color="bg-gradient-to-br from-amber-900/70 to-amber-700/70"
        />

        <FeatureCard
          title="Settings"
          description="Configure your account preferences, notifications, and application settings."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          href="/app/under"
          color="bg-gradient-to-br from-gray-800/70 to-gray-700/70"
        />

        <FeatureCard
          title="Help & Support"
          description="Access documentation, FAQs, and contact support for assistance."
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          href="/app/under"
          color="bg-gradient-to-br from-purple-900/70 to-purple-700/70"
        />
      </div>

      {/* Quick access section */}
      <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/app/clients/new"
            className="flex flex-col items-center p-4 bg-gray-800/80 rounded-lg hover:bg-gray-700/80 transition-colors border border-gray-700/50"
          >
            <div className="h-10 w-10 bg-blue-600/30 rounded-full flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-200">Add Client</span>
          </Link>

          <Link
            href="/app/chat"
            className="flex flex-col items-center p-4 bg-gray-800/80 rounded-lg hover:bg-gray-700/80 transition-colors border border-gray-700/50"
          >
            <div className="h-10 w-10 bg-green-600/30 rounded-full flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-200">New Chat</span>
          </Link>

          <Link
            href="/app/under"
            className="flex flex-col items-center p-4 bg-gray-800/80 rounded-lg hover:bg-gray-700/80 transition-colors border border-gray-700/50"
          >
            <div className="h-10 w-10 bg-amber-600/30 rounded-full flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-200">Recent Activity</span>
          </Link>

          <Link
            href="/app/under"
            className="flex flex-col items-center p-4 bg-gray-800/80 rounded-lg hover:bg-gray-700/80 transition-colors border border-gray-700/50"
          >
            <div className="h-10 w-10 bg-purple-600/30 rounded-full flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-200">Export Data</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
