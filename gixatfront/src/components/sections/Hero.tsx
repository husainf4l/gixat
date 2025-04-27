"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="pt-32 pb-24 overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/60 z-0"></div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/window.svg')] bg-repeat opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-primary">WIDD.AI</span> <br />
              Sports Intelligence <br />
              <span className="text-secondary">with Soul</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-black/80 mb-8 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Fusing cutting-edge AI with the soul of the game. Born in Saudi
              Arabia, built for athletes, coaches, and fans who believe
              performance is about more than numbers&mdash;it&apos;s about
              heart.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-8 py-3 rounded-md text-lg font-medium"
              >
                Explore Demo
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-secondary text-secondary px-8 py-3 rounded-md text-lg font-medium hover:bg-secondary hover:text-white transition-colors duration-300"
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 mix-blend-overlay z-10"></div>
              <Image
                src="/hero-sports.svg"
                alt="WIDD.AI Sports Intelligence"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "contain" }}
                className="z-0"
                priority
              />

              {/* Animated overlay elements */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-transparent p-6 z-20"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
                  <p className="text-white text-sm">Live analysis processing</p>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-secondary"
                      initial={{ width: "0%" }}
                      animate={{ width: "80%" }}
                      transition={{ delay: 1, duration: 1.5 }}
                    ></motion.div>
                  </div>
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-secondary"
                      initial={{ width: "0%" }}
                      animate={{ width: "65%" }}
                      transition={{ delay: 1.1, duration: 1.2 }}
                    ></motion.div>
                  </div>
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-secondary"
                      initial={{ width: "0%" }}
                      animate={{ width: "92%" }}
                      transition={{ delay: 1.2, duration: 1.8 }}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating UI elements */}
            <motion.div
              className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg z-30"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-primary font-medium">
                  Player Motion Analysis
                </span>
              </div>
              <div className="mt-2 w-32 h-8 bg-primary/10 rounded-md"></div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg z-30"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-primary font-medium">
                  Ethical AI Tracking
                </span>
              </div>
              <div className="mt-2 w-32 h-8 bg-secondary/10 rounded-md"></div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
