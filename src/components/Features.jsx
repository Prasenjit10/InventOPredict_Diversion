import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    title: "Stock-out Date Prediction",
    description: "Predict exactly when inventory will run out.",
  },
  {
    title: "ML-powered Forecasting Engine",
    description: "Forecast future stock using ML models.",
  },
  {
    title: "Interactive Data Visualizations",
    description: "View trends with dynamic charts.",
  },
  {
    title: "Low Stock Alerts",
    description: "Instant alerts when stock is low.",
  },
  {
    title: "Secure Data Handling",
    description: "End-to-end encrypted data security.",
  },
  {
    title: "Downloadable Reports",
    description: "Export reports in multiple formats.",
  },
];

const Features = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 3) % features.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const visibleFeatures = [
    features[index],
    features[(index + 1) % features.length],
    features[(index + 2) % features.length],
  ];

  return (
    <section className="py-14 overflow-hidden">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Our Features
      </h2>

      <div className="flex justify-center gap-8">
        <AnimatePresence mode="wait">
          {visibleFeatures.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-[320px] min-h-[200px] bg-blue-50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition"
            >
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-700 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Features;
