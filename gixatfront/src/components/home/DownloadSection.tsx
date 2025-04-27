"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DownloadSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("download-section");
      if (section) {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (sectionTop < windowHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5,
      },
    },
  };

  const childVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="download-section"
      className="py-20 bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden"
    >
      <motion.div
        className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Text Content */}
        <motion.div
          variants={childVariants}
          className="lg:w-1/2 text-right mb-10 lg:mb-0 order-2 lg:order-1"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            حمّل التطبيق واستمتع بتجربة كاملة
          </h2>
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            احصل على تجربة الواقع المعزز الكاملة من خلال تطبيقنا. شاهد
            الإحصائيات الحية، تفاعل مع اللاعبين والمباراة بطريقة لم تختبرها من
            قبل.
          </p>

          <div className="flex flex-wrap justify-end gap-5 mt-10">
            <motion.a
              href="#"
              className="download-button flex items-center bg-black border border-gray-600 hover:border-gray-400 px-5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg
                className="w-8 h-8 ml-3"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              <div>
                <div className="text-xs text-gray-300">تحميل من</div>
                <div className="text-xl font-semibold">App Store</div>
              </div>
            </motion.a>

            <motion.a
              href="#"
              className="download-button flex items-center bg-black border border-gray-600 hover:border-gray-400 px-5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg
                className="w-8 h-8 ml-3"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div>
                <div className="text-xs text-gray-300">تحميل من</div>
                <div className="text-xl font-semibold">Google Play</div>
              </div>
            </motion.a>
          </div>
        </motion.div>

        {/* Phone Image */}
        <motion.div
          variants={childVariants}
          className="lg:w-2/5 order-1 lg:order-2 relative"
        >
          <div className="relative w-64 h-[500px] mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-[40px] blur-lg opacity-30 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-[500px]">
                <Image
                  src="/images/install.png"
                  alt="Mobile App Mockup"
                  fill
                  className="object-cover drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Floating elements for visual effect */}
          <div className="absolute -top-10 right-10 w-20 h-20 bg-blue-500 opacity-10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-20 left-0 w-32 h-32 bg-cyan-400 opacity-10 rounded-full blur-xl animate-float-delay"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DownloadSection;
