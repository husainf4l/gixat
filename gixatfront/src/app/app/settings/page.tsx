import React from "react";
import Image from "next/image";

export default function SettingsPage() {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center relative">
      <div className="absolute inset-0 flex justify-center items-center">
        <Image
          src="/images/widd-diagram.png"
          alt="WIDD Diagram"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
