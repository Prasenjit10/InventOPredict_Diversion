import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUpload } from "react-icons/fa";
import Chart from "../components/Chart";
import Features from "../components/Features";
import { Link } from 'react-router-dom';
const words = ["Predict", "Prepare", "Perform"];

const Home = () => {
  const [index, setIndex] = useState(0);
  const pathRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseEnter = () => {
    if (pathRef.current) {
      pathRef.current.style.strokeDasharray = 200;
      pathRef.current.style.strokeDashoffset = 0;
    }
  };

  const handleMouseLeave = () => {
    if (pathRef.current) {
      pathRef.current.style.strokeDashoffset = 200;
    }
  };

  return (
    <div className=" pt-24 overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 md:px-12 lg:px-24 py-10 gap-10 bg-white">
        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Built to {" "}
            <span className="text-indigo-600 font-greatvibes text-5xl sm:text-6xl">
              <AnimatePresence mode="wait">
                <motion.span
                  key={words[index]}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5 }}
                >
                  {words[index]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
          <p className="mt-6 text-gray-700 text-lg max-w-xl">
            Predict stock-outs before they happen. Our ML-powered tool analyzes past data
            to forecast demand and help your business avoid costly inventory gaps — all
            from a simple CSV upload.
          </p>
          <Link to="/analysis">
            <button className="mt-6 px-6 py-3 bg-indigo-100 hover:bg-indigo-200 rounded-lg text-indigo-700 font-semibold shadow transition">
              Try Now
            </button>
          </Link>
        </div>

        <div className="flex-1">
          <Chart/>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="bg-blue-50 py-16 px-6 md:px-12 lg:px-24">
        <h2 className="text-center text-3xl font-bold mb-12">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {["Stock-out Date Prediction", "ML-powered Forecasting Engine", "Interactive Data Visualizations", "Low Stock Alerts & Notifications", "Secure & Encrypted Data Handling", "Downloadable Reports"].map(
            (feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-indigo-100 text-gray-800 p-6 rounded-xl shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold mb-2">{feature}</h3>
                <p className="text-sm">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae,
                  aliquid.
                </p>
              </motion.div>
            )
          )}
        </div>
      </section> */}
      <section className="">
        <Features/>
      </section>
      

      {/* How It Works Section */}
      <section className="bg-white py-16 px-6 md:px-12 lg:px-24">
        <h2 className="text-center text-3xl font-bold mb-12">How It Works</h2>
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="bg-blue-50 p-10 rounded-xl shadow-xl flex flex-col items-center w-full lg:w-1/2">
            <FaUpload className="text-4xl text-indigo-600 mb-4" />
            <div className="w-full h-48 border-2 border-dashed border-indigo-300 flex items-center justify-center text-center p-4 bg-gray-50 rounded-md">
              <div>
                Drag & Drop Files Here
                <br />or<br />
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  Browse File
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <p className="text-lg text-gray-700 leading-relaxed">
              Predict stock-outs before they happen. Our ML-powered tool analyzes past
              data to forecast demand and help your business avoid costly inventory gaps
              — all from a simple CSV upload.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
