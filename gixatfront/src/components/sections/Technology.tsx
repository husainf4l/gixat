"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const Technology = () => {
  const [activeTab, setActiveTab] = useState("data");

  const tabs = [
    { id: "data", label: "Data Collection" },
    { id: "ai", label: "AI Processing" },
    { id: "ethics", label: "Ethical Framework" },
    { id: "viz", label: "Visualization" },
  ];

  return (
    <section id="technology" className="py-24 bg-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Our Technology
          </h2>
          <p className="text-lg text-black/70 max-w-3xl mx-auto">
            How WIDD.AI creates a new standard for ethical sports intelligence
            with advanced technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24">
              <div className="p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "hover:bg-primary/10"
                    }`}
                  >
                    <div className="font-medium">{tab.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            {activeTab === "data" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-bold text-primary">
                  Advanced Data Collection
                </h3>
                <p className="text-lg text-black/80">
                  WIDD.AI employs multi-sensor arrays and computer vision
                  systems to capture over 150 unique data points from each
                  player, the ball, and the environment per second during live
                  play.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-semibold text-primary mb-3">
                      Optical Tracking
                    </h4>
                    <p className="text-black/70 mb-3">
                      High-precision camera systems with 360° coverage track
                      player and ball movement with millimeter precision.
                    </p>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{ width: "95%" }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-primary mt-1">
                      95% accuracy
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-semibold text-secondary mb-3">
                      Biometric Analysis
                    </h4>
                    <p className="text-black/70 mb-3">
                      Non-invasive biometric monitoring to track player
                      exertion, fatigue, and physiological responses.
                    </p>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-secondary h-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-secondary mt-1">
                      92% accuracy
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-white rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-3">
                    Data Collection Infrastructure
                  </h4>
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2 mt-0.5">
                            ✓
                          </div>
                          <span>
                            Stadium-wide sensor network with 5G connectivity
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2 mt-0.5">
                            ✓
                          </div>
                          <span>Edge computing for real-time processing</span>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2 mt-0.5">
                            ✓
                          </div>
                          <span>Secure encrypted data transmission</span>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2 mt-0.5">
                            ✓
                          </div>
                          <span>
                            Weather and environmental condition monitoring
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm font-medium text-black/60 mb-1">
                          Data Processing Speed
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          3ms
                        </div>
                        <div className="text-xs text-black/50">
                          from capture to analysis
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "ai" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-bold text-primary">
                  AI Processing Engine
                </h3>
                <p className="text-lg text-black/80">
                  Our multi-layered AI system combines deep learning, computer
                  vision, and emotional intelligence to create a comprehensive
                  understanding of sports performance.
                </p>

                <div className="relative rounded-xl overflow-hidden bg-white p-6 border border-gray-100 shadow-md">
                  <h4 className="text-xl font-semibold text-primary mb-4">
                    WIDD.AI Neural Architecture
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="text-primary font-medium mb-2">
                        Input Layer
                      </div>
                      <ul className="text-sm text-black/70 space-y-1">
                        <li>• Motion data</li>
                        <li>• Biometric signals</li>
                        <li>• Historical patterns</li>
                        <li>• Environmental factors</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="text-primary font-medium mb-2">
                        Processing Layers
                      </div>
                      <ul className="text-sm text-black/70 space-y-1">
                        <li>• Convolutional networks</li>
                        <li>• Transformers</li>
                        <li>• Recurrent units</li>
                        <li>• Emotional analysis modules</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-primary/20 rounded-lg">
                      <div className="text-primary font-medium mb-2">
                        Output Layer
                      </div>
                      <ul className="text-sm text-black/70 space-y-1">
                        <li>• Performance metrics</li>
                        <li>• Emotional states</li>
                        <li>• Tactical recommendations</li>
                        <li>• Predictive insights</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <h5 className="font-medium text-secondary mb-2">
                      Key AI Innovations
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Emotional Context Recognition
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary"
                            style={{ width: "98%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Industry-leading</span>
                          <span>98%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Tactical Pattern Analysis
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: "95%" }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Advanced</span>
                          <span>95%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-semibold text-primary mb-3">
                      Real-Time Analysis
                    </h4>
                    <p className="text-black/70">
                      Processes 1.2 million data points per minute during a
                      match, providing instant insights to teams and viewers.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-semibold text-primary mb-3">
                      Continuous Learning
                    </h4>
                    <p className="text-black/70">
                      WIDD.AI improves with every match, learning the nuances of
                      different teams, players, and conditions.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "ethics" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-bold text-primary">
                  Ethical Framework
                </h3>
                <p className="text-lg text-black/80">
                  WIDD.AI is built on a foundation of ethical principles that
                  guide how we collect, process, and utilize sports data while
                  respecting privacy and cultural values.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl overflow-hidden shadow-md">
                    <div className="h-2 bg-primary"></div>
                    <div className="p-6">
                      <h4 className="text-xl font-semibold text-primary mb-4">
                        Core Ethical Principles
                      </h4>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-0.5">
                            1
                          </div>
                          <div>
                            <div className="font-medium">
                              Respect for Privacy
                            </div>
                            <p className="text-sm text-black/70 mt-1">
                              All personal data is anonymized and protected with
                              industry-leading security. Players have full
                              ownership of their data.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-0.5">
                            2
                          </div>
                          <div>
                            <div className="font-medium">
                              Cultural Sensitivity
                            </div>
                            <p className="text-sm text-black/70 mt-1">
                              Our AI is trained to respect cultural contexts and
                              values, especially important in the Saudi context.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-0.5">
                            3
                          </div>
                          <div>
                            <div className="font-medium">
                              Fair Play Promotion
                            </div>
                            <p className="text-sm text-black/70 mt-1">
                              Our algorithms are designed to encourage
                              sportsmanship and never to promote unfair
                              advantages.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden shadow-md">
                    <div className="h-2 bg-secondary"></div>
                    <div className="p-6">
                      <h4 className="text-xl font-semibold text-secondary mb-4">
                        Ethical Innovation
                      </h4>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">
                              Data Consent Framework
                            </div>
                            <div className="text-sm text-secondary">
                              Industry Leading
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary"
                              style={{ width: "100%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">
                              Bias Detection & Removal
                            </div>
                            <div className="text-sm text-secondary">
                              Advanced
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary"
                              style={{ width: "94%" }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">
                              Transparency Protocols
                            </div>
                            <div className="text-sm text-secondary">
                              Complete
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-secondary"
                              style={{ width: "97%" }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
                        <div className="text-sm font-medium text-secondary mb-2">
                          Ethics Advisory Board
                        </div>
                        <p className="text-sm text-black/70">
                          WIDD.AI maintains an independent ethics board with
                          experts from sports, technology, and religious
                          authorities to ensure alignment with Saudi values and
                          global best practices.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md">
                  <blockquote className="text-lg italic text-black/80 border-l-4 border-primary pl-4">
                    &ldquo;WIDD.AI represents a new standard in ethical sports
                    technology, showing how innovation can be advanced while
                    remaining true to cultural values and putting humans at the
                    center.&rdquo;
                  </blockquote>
                  <div className="mt-4 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      SA
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">Dr. Sarah Alfarhan</div>
                      <div className="text-sm text-black/60">
                        Chair, Ethics in Sports Technology
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "viz" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-bold text-primary">
                  Immersive Visualizations
                </h3>
                <p className="text-lg text-black/80">
                  WIDD.AI translates complex data into stunning visuals and
                  interactive experiences that make sports intelligence
                  accessible and engaging for everyone.
                </p>

                <div className="grid grid-cols-1 gap-8">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                    <div className="relative h-64 bg-gradient-to-r from-primary to-secondary">
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                        Interactive 3D Replay Technology
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-semibold text-primary">
                          Immersive Match Experiences
                        </h4>
                        <div className="text-sm text-black/60">
                          Next-generation engagement
                        </div>
                      </div>
                      <p className="text-black/70 mb-6">
                        Viewers can explore key moments from any angle, with
                        layers of data visualizations that reveal the science
                        behind the magic of sports.
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-primary/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">
                            360°
                          </div>
                          <div className="text-xs text-black/60">
                            Viewing angles
                          </div>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">
                            15+
                          </div>
                          <div className="text-xs text-black/60">
                            Data overlays
                          </div>
                        </div>
                        <div className="p-3 bg-primary/15 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">
                            8K
                          </div>
                          <div className="text-xs text-black/60">
                            Resolution
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                      <h4 className="text-lg font-semibold text-primary mb-3">
                        Dynamic Heat Maps
                      </h4>
                      <p className="text-black/70 mb-4">
                        Visualize player movement, team formations, and spatial
                        control with real-time color-coded heat maps.
                      </p>
                      <div className="h-32 bg-gradient-to-br from-primary/10 via-secondary/50 to-primary/30 rounded-lg"></div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-md">
                      <h4 className="text-lg font-semibold text-primary mb-3">
                        Emotional Pulse Tracking
                      </h4>
                      <p className="text-black/70 mb-4">
                        See the emotional dynamics of players, teams and crowds
                        visualized through dynamic wavelines and color mapping.
                      </p>
                      <div className="h-32 flex items-center justify-center">
                        <svg
                          width="100%"
                          height="80"
                          viewBox="0 0 400 80"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0,40 C20,10 40,60 60,40 C80,20 100,60 120,40 C140,20 160,70 180,40 C200,10 220,50 240,40 C260,30 280,60 300,40 C320,20 340,50 360,40 C380,30 400,40 400,40"
                            stroke="#2B5B63"
                            strokeWidth="3"
                            fill="none"
                          />
                          <path
                            d="M0,40 C30,30 60,50 90,40 C120,30 150,60 180,40 C210,20 240,70 270,40 C300,10 330,50 360,40 C390,30 400,40 400,40"
                            stroke="#E5A940"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="4 4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6">
                    <h4 className="text-xl font-semibold text-primary mb-4">
                      Accessibility Features
                    </h4>
                    <p className="text-black/80 mb-6">
                      WIDD.AI is committed to making sports data accessible to
                      everyone, with features designed for users with different
                      needs and preferences.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="font-medium mb-2">
                          Color-blind friendly
                        </div>
                        <p className="text-sm text-black/70">
                          All visualizations are tested for color-blind
                          accessibility with alternative color schemes.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="font-medium mb-2">
                          Audio descriptions
                        </div>
                        <p className="text-sm text-black/70">
                          AI-generated audio descriptions of key visual data for
                          vision-impaired users.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="font-medium mb-2">
                          Multilingual support
                        </div>
                        <p className="text-sm text-black/70">
                          Available in Arabic, English, and 15+ other languages
                          with cultural adaptations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;
