"use client";

import Image from "next/image";
import React from "react";

const ImmersiveSportsSection: React.FC = () => {
  return (
    <section className="relative w-full flex items-center justify-center min-h-[70vh] md:min-h-[80vh] bg-gray-200">
      <div className="absolute inset-0">
        <Image
          src="/images/section/a2.png"
          alt="Immersive Sports Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center justify-between relative z-10">
        <div className="w-full mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-lg text-center">
            مقعدك بعيد؟ قربناه لك.
          </h2>
          <div className="w-20 h-1 bg-blue-500 mb-6 mx-auto" />
          <p className="text-xl  text-white  mb-8 drop-shadow-lg text-center max-w-3xl mx-auto">
            مع كاميراتنا الـ360° المنتشرة في كل زاوية من الاستاد، ما في لقطة
            تفوتك. عِش اللحظة وكأنك على خط التماس… مهما كان مقعدك.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 border-blue-400/30 shadow-lg shadow-blue-500/20 relative">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="/images/hero-bg.webp"
            >
              <source src="/videos/2.mp4" type="video/mp4" />
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImmersiveSportsSection;
