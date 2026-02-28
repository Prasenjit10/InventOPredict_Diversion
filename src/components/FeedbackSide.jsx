import React from "react";
import { MessageSquare, ShieldCheck, Clock } from "lucide-react";

const FeedbackSide = () => {
  const points = [
    {
      title: "We Read Every Message",
      desc: "Your feedback is reviewed by our product and support teams.",
      icon: <MessageSquare className="text-blue-500" />
    },
    {
      title: "Your Data Is Safe",
      desc: "We respect your privacy and never share your information.",
      icon: <ShieldCheck className="text-green-500" />
    },
    {
      title: "Quick Response",
      desc: "We usually respond within 24–48 working hours.",
      icon: <Clock className="text-purple-500" />
    }
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Why Share Feedback?
        </h3>
        <p className="text-gray-600 text-sm">
          Your thoughts help us improve InventOPredict and serve you better.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {points.map((p, i) => (
          <div
            key={i}
            className="bg-blue-100 p-6 rounded-xl shadow-sm text-center
            transition transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-4 flex justify-center">
              {p.icon}
            </div>
            <h4 className="font-semibold text-lg">{p.title}</h4>
            <p className="text-sm text-gray-600 mt-2">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Support Note */}
      <div className="bg-blue-100 border border-blue-100 rounded-xl p-6">
        <h4 className="font-semibold text-blue-600 mb-2">
          Need Immediate Help?
        </h4>
        <p className="text-gray-700 text-sm">
          For urgent issues, please mention <b>“URGENT”</b> in your message and
          our support team will prioritize your request.
        </p>
      </div>
    </div>
  );
};

export default FeedbackSide;
