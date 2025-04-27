import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const WelcomeCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-6 shadow-lg border border-blue-500/20"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            مرحبًا بك في رؤيا 360°
          </h2>
          <p className="text-gray-300">
            تجربة كرة القدم المدعومة بالذكاء الاصطناعي مع كاميرات 360° على قمصان
            اللاعبين وتحليلات أداء مباشرة
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/room/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
            >
              إنشاء بث 360°
            </Link>
            <Link
              href="/watch/live"
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-all"
            >
              مشاهدة البث بنظارات VR
            </Link>
          </div>
        </div>
        <div className="hidden md:block relative w-32 h-32">
          <Image
            src="/images/widd360.png"
            alt="Widd Logo"
            width={128}
            height={128}
            className="object-contain"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;
