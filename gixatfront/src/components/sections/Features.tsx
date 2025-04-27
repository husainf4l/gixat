"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const Features = () => {
  const features = [
    {
      icon: "/file.svg",
      title: "Live Data Capture",
      description:
        "Real-time tracking and analysis of player movements, team formations, and game dynamics with millisecond precision.",
    },
    {
      icon: "/globe.svg",
      title: "Emotional Intelligence",
      description:
        "Advanced AI that recognizes player emotions, team chemistry, and crowd engagement to understand the human side of sports.",
    },
    {
      icon: "/window.svg",
      title: "Immersive Visualizations",
      description:
        "Transform complex sports data into stunning 3D visualizations and interactive replays that bring insights to life.",
    },
    {
      icon: "/file.svg",
      title: "Ethical AI Framework",
      description:
        "Built on principles that respect player privacy, cultural values, and the spirit of fair play in sports.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Redefining Sports Intelligence
          </h2>
          <p className="text-lg text-black/70 max-w-3xl mx-auto">
            WIDD.AI combines cutting-edge technology with deep sports knowledge
            to create an intelligence platform that understands both the science
            and soul of the game.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={32}
                  height={32}
                  className="text-primary"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-primary">
                {feature.title}
              </h3>
              <p className="text-black/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Born in Saudi Arabia, <br />
                Built for the World
              </h3>
              <p className="text-white/90 mb-6">
                WIDD.AI represents the future of Saudi innovation in sports
                technology, combining global technical excellence with deep
                cultural understanding of what makes sports meaningful.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-secondary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
              >
                Our Technology
              </motion.button>
            </div>
            <div className="relative h-64 lg:h-80">
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10"></div>
                <Image
                  src="/saudi-sports.svg"
                  alt="WIDD.AI in Saudi Arabia"
                  fill
                  style={{ objectFit: "cover" }}
                  className="z-0 rounded-xl"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
