import React from 'react';

const About = () => {
  return (
    <div className=" pt-24 min-h-screen px-6 py-10 bg-white text-gray-800 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-blue-600">About Us</h1>

      <div className="max-w-4xl text-lg leading-relaxed space-y-6">
        <p>
          Welcome to <strong>SmartStock Predictor</strong>, your intelligent assistant for anticipating stock depletion. Our platform allows businesses to upload their inventory data files (CSV/XLSX), which are analyzed using a trained <strong>machine learning model</strong>.
        </p>

        <p>
          Once the file is uploaded, our system processes the data and predicts the estimated <strong>date when your stock may run out</strong>. This empowers you to make informed decisions, manage inventory efficiently, and avoid unexpected stockouts.
        </p>

        <p>
          Our mission is to help small and medium businesses optimize their supply chain using accessible AI-powered tools — no complex software setup needed.
        </p>

        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
          <strong>Disclaimer:</strong> While our model is trained on historical data and tuned for accuracy, <strong>predicted dates are approximate</strong> and may vary based on real-world conditions. Always verify critical decisions with your supply chain team.
        </div>

        <p>
          We’re continuously working to improve our model and provide even better forecasting. Your feedback helps us grow — thank you for using our service!
        </p>
      </div>
    </div>
  );
};

export default About;
