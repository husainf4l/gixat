"use client";

import React from "react";
import Image from "next/image";

export default function UnderConstructionPage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-6 relative h-40 w-40 mx-auto">
          <Image
            src="/images/widd-logo.webp"
            alt="WIDD Logo"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          Under Construction
        </h1>

        <p className="text-slate-300 mb-6">
          We&apos;re currently working on this feature. Check back soon for
          updates!
        </p>

        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full w-1/3 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
