"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const DemoAnalytics = () => {
  const [activeTab, setActiveTab] = useState("performance");

  const tabs = [
    { id: "performance", label: "Performance" },
    { id: "tactics", label: "Tactical Analysis" },
    { id: "emotions", label: "Emotional Tracking" },
    { id: "predictions", label: "Predictions" },
  ];

  // Demo data for the different tabs
  const demoData = {
    performance: [
      {
        player: "Mohammed Al-Saeed",
        metric: "Sprint Speed",
        value: 34.2,
        unit: "km/h",
        change: "+2.1",
      },
      {
        player: "Ahmed Hassan",
        metric: "Distance Covered",
        value: 11.8,
        unit: "km",
        change: "+0.5",
      },
      {
        player: "Khalid Al-Dawsari",
        metric: "Pass Accuracy",
        value: 93.4,
        unit: "%",
        change: "+1.2",
      },
      {
        player: "Fahad Al-Muwallad",
        metric: "Shot Precision",
        value: 82.1,
        unit: "%",
        change: "+4.5",
      },
      {
        player: "Salem Al-Dawsari",
        metric: "Dribble Success",
        value: 77.8,
        unit: "%",
        change: "-1.3",
      },
    ],
    tactics: [
      { metric: "Ball Possession", team1: 58, team2: 42 },
      { metric: "Pressure Success", team1: 73, team2: 65 },
      { metric: "Counter Attack Speed", team1: 12.3, team2: 14.7, unit: "sec" },
      { metric: "Formation Consistency", team1: 88, team2: 76, unit: "%" },
      { metric: "Defensive Line Height", team1: 36.2, team2: 42.7, unit: "m" },
    ],
    emotions: [
      {
        timepoint: "15:32",
        event: "Goal celebration",
        intensity: 92,
        sentiment: "Extremely Positive",
      },
      {
        timepoint: "23:47",
        event: "Missed opportunity",
        intensity: 67,
        sentiment: "Frustration",
      },
      {
        timepoint: "36:15",
        event: "Team huddle",
        intensity: 78,
        sentiment: "Unity & Focus",
      },
      {
        timepoint: "52:08",
        event: "Defensive stand",
        intensity: 84,
        sentiment: "Determined",
      },
      {
        timepoint: "88:22",
        event: "Crowd response",
        intensity: 95,
        sentiment: "Euphoric",
      },
    ],
    predictions: [
      { prediction: "Victory probability", value: 64, unit: "%" },
      { prediction: "Expected goals", value: 2.7, unit: "" },
      { prediction: "Fatigue impact", value: "Medium", risk: "Low" },
      {
        prediction: "Key player influence",
        player: "Fahad Al-Muwallad",
        impact: "High",
      },
      {
        prediction: "Weather effect on passing",
        impact: "-3.2%",
        confidence: "High",
      },
    ],
  };

  return (
    <section id="demo" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Live Analytics Demo
          </h2>
          <p className="text-lg text-black/70 max-w-3xl mx-auto">
            Experience how WIDD.AI processes live sports data with emotional
            intelligence and precision.
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-6 py-4 text-lg font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-secondary text-primary"
                      : "text-black/60 hover:text-primary"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Live data visualization header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-secondary rounded-full animate-pulse mr-2"></div>
                <p className="text-primary font-medium">Live Data Processing</p>
              </div>
              <div className="text-sm text-black/60">
                Al Hilal vs. Al Nassr • Saudi Pro League
              </div>
            </div>

            {/* Performance Data */}
            {activeTab === "performance" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-primary/5 rounded-lg p-4">
                  <div className="text-lg font-medium">
                    Player Performance Metrics
                  </div>
                  <div className="text-sm text-primary">Updated 32s ago</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Player
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Metric
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Value
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Change
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {demoData.performance.map((item, index) => (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.player}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.metric}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.value} {item.unit}
                                </td>
                                <td
                                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                                    item.change.startsWith("+")
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {item.change}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="h-full bg-gradient-to-br from-primary to-primary/70 rounded-lg p-6 text-white flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-4">AI Insights</h3>
                        <p className="text-white/90 mb-6">
                          Performance data suggests Fahad Al-Muwallad&apos;s shot
                          precision has significantly improved, making him a key
                          offensive asset for today&apos;s match.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm text-white/80">
                          Team Confidence Index
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-secondary"
                            initial={{ width: "0%" }}
                            animate={{ width: "82%" }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                          ></motion.div>
                        </div>
                        <div className="text-right text-sm text-white/80">
                          82%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tactical Analysis */}
            {activeTab === "tactics" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-primary/5 rounded-lg p-4">
                  <div className="text-lg font-medium">
                    Team Tactical Comparison
                  </div>
                  <div className="text-sm text-primary">
                    Second Half • 67:22
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {demoData.tactics.map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-black/70">
                          {item.metric}
                        </span>
                        <span className="text-xs text-black/60">
                          {item.unit ? item.unit : "%"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 text-right font-semibold text-primary">
                          {item.team1}
                          {item.unit ? "" : "%"}
                        </div>
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${item.team1}%` }}
                          ></div>
                        </div>
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-secondary"
                            style={{ width: `${item.team2}%` }}
                          ></div>
                        </div>
                        <div className="w-16 font-semibold text-secondary">
                          {item.team2}
                          {item.unit ? "" : "%"}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-black/60 mt-2">
                        <div>Al Hilal</div>
                        <div>Al Nassr</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Tracking */}
            {activeTab === "emotions" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-primary/5 rounded-lg p-4">
                  <div className="text-lg font-medium">
                    Emotional Intelligence Analysis
                  </div>
                  <div className="text-sm text-primary">
                    Real-time sentiment tracking
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Intensity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sentiment
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {demoData.emotions.map((item, index) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.timepoint}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {item.event}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      item.intensity > 80
                                        ? "bg-secondary"
                                        : "bg-primary"
                                    }`}
                                    style={{ width: `${item.intensity}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs mt-1">
                                  {item.intensity}%
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {item.sentiment}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">
                      Emotion-Based Insights
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <div className="text-sm font-medium mb-1">
                          Team Chemistry Indicator
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: "78%" }}
                            transition={{ duration: 1 }}
                          ></motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-black/60 mt-1">
                          <div>Low</div>
                          <div>High</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-1">
                          Crowd Energy Impact
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-secondary"
                            initial={{ width: "0%" }}
                            animate={{ width: "92%" }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                          ></motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-black/60 mt-1">
                          <div>Minimal</div>
                          <div>Significant</div>
                        </div>
                      </div>

                      <div className="bg-primary/10 p-4 rounded-lg">
                        <div className="text-sm font-medium mb-2">
                          AI Analysis:
                        </div>
                        <p className="text-sm text-black/80">
                          The goal celebration at 15:32 created a sustained
                          positive emotional momentum that is still influencing
                          team dynamics and performance 20 minutes later.
                          Players are showing increased risk-taking in offensive
                          plays.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Predictions */}
            {activeTab === "predictions" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-primary/5 rounded-lg p-4">
                  <div className="text-lg font-medium">
                    AI-Powered Predictions
                  </div>
                  <div className="text-sm text-primary">
                    Based on real-time analysis
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {demoData.predictions.slice(0, 2).map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-6"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium">
                          {item.prediction}
                        </h3>
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-white font-bold">
                            {typeof item.value === "number" ? item.value : "!"}
                          </span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {item.value}
                        {item.unit}
                      </div>
                      <div className="text-sm text-black/60">
                        {index === 0
                          ? "Calculated from 25+ performance factors"
                          : "Based on shot quality and frequency"}
                      </div>
                      {index === 0 && (
                        <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1 }}
                          ></motion.div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">
                    Risk & Opportunity Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {demoData.predictions.slice(2).map((item, index) => (
                      <motion.div
                        key={index}
                        className="bg-white rounded-lg p-4 shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <div className="text-sm font-medium mb-2">
                          {item.prediction}
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xl font-semibold text-primary">
                              {item.value || item.player || item.impact}
                            </div>
                            <div className="text-xs text-black/60 mt-1">
                              {item.risk || item.impact || item.confidence}
                            </div>
                          </div>
                          <div
                            className={`h-10 w-10 rounded-full ${
                              index === 0
                                ? "bg-green-100"
                                : index === 1
                                ? "bg-primary/20"
                                : "bg-secondary/20"
                            } flex items-center justify-center`}
                          >
                            <span
                              className={`text-lg ${
                                index === 0
                                  ? "text-green-600"
                                  : index === 1
                                  ? "text-primary"
                                  : "text-secondary"
                              }`}
                            >
                              {index === 0 ? "✓" : index === 1 ? "★" : "⚠"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoAnalytics;
