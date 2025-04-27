"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function AppPage() {
  const [showDevices, setShowDevices] = useState(false);

  // Mock device list for the demo
  const mockDevices = [
    { id: 1, name: "WIDD VAR Pro #001", status: "متصل" },
    { id: 2, name: "WIDD VAR Elite #045", status: "متاح" },
    { id: 3, name: "WIDD VAR Referee #112", status: "متاح" },
    { id: 4, name: "WIDD VAR Stadium #007", status: "متاح" },
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen  py-12 px-4 text-right">
      <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        <div className="relative h-64 w-full">
          <Image
            src="/images/section/var.webp"
            alt="WIDD VAR تقنية"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">WIDD VAR</h1>
              <p className="text-sm opacity-90">
                منظومة هجينة تجمع بين الواقع المعزز , الواقع الافتراضي بطريقة
                تحترم الحضور وتعزز اللحظة.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-right text-white">
              الاتصال بالأجهزة
            </h2>
            <p className="text-gray-400 mb-6 text-right">
              قم بالاتصال بأجهزة WIDD VAR المتاحة للوصول إلى ميزات التحكيم
              المتقدمة
            </p>

            <button
              onClick={() => setShowDevices(true)}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 px-6 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <div className="mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold">الاتصال بجهاز WIDD VAR</span>
            </button>
          </div>

          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <p className="text-sm text-gray-400">جاهز للاتصال</p>
          </div>
        </div>
      </div>

      {/* Device Modal */}
      {showDevices && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden border border-gray-700">
            <div className="p-5 bg-primary text-white flex justify-between items-center">
              <button
                onClick={() => setShowDevices(false)}
                className="text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h3 className="text-xl font-bold">أجهزة WIDD VAR المتاحة</h3>
            </div>

            <div className="p-5">
              <div className="mb-4">
                <p className="text-gray-400 text-sm text-right">
                  اختر جهازاً للاتصال:
                </p>
              </div>

              <div className="space-y-3 mb-5">
                {mockDevices.map((device) => (
                  <div
                    key={device.id}
                    className="border border-gray-700 rounded-lg p-4 flex justify-between items-center hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          device.status === "متصل"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        } mr-2`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        {device.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <h4 className="font-medium text-white">{device.name}</h4>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowDevices(false)}
                  className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
