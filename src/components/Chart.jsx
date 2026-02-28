import React from "react";
import { Upload, Brain, CheckCircle } from "lucide-react";

const Chart = () => {
  const steps = [
    {
      title: "Upload Inventory Data",
      desc: "Upload your Excel or CSV file in seconds.",
      icon: <Upload className="text-blue-500" />
    },
    {
      title: "AI Analyzes Demand",
      desc: "Our ML model detects future stockout risks.",
      icon: <Brain className="text-purple-500" />
    },
    {
      title: "Act Before Losses",
      desc: "Get reorder dates and risk alerts instantly.",
      icon: <CheckCircle className="text-green-500" />
    }
  ];

  return (
    <div className="w-full space-y-8">
      {/* Headline */}
      <div className="text-center animate-fadeIn">
        
        
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div
            key={i}
            className="bg-blue-100 p-6 rounded-xl shadow-md text-center
            transform transition duration-300 hover:-translate-y-2"
          >
            <div className="text-4xl mb-4">{s.icon}</div>
            <h3 className="font-semibold text-lg">{s.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Sample Output */}
      <div className="bg-blue-100 border border-blue-100 rounded-xl p-6">
        <h4 className="font-semibold text-blue-600 mb-2">
          Example AI Insight
        </h4>
        <p className="text-gray-700">
          ⚠️ *Item “LED Bulb 9W” likely to run out in 6 days.
          Suggested reorder date: <b>22 Feb</b>.*
        </p>
      </div>

      
      
    </div>
  );
};

export default Chart;
