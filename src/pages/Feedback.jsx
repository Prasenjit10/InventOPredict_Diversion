import React, { useState } from 'react';
import FeedbackSide from "../components/FeedbackSide";

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/Feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      alert(data.message);
      setFormData({ name: "", email: "", phone: "", experience: "" }); // clear form
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to send feedback");
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-white flex flex-col justify-center items-center p-6">
      <div className="max-w-6xl w-full bg-white rounded-lg shadow-md flex flex-col md:flex-row overflow-hidden">
        
        {/* Form Section */}
        <div className="md:w-1/2 p-8 md:p-12">
          <h2 className="text-4xl font-bold mb-4">
            Feedback <span className="text-blue-400">Us</span>
          </h2>
          <p className="text-gray-600 mb-8">
            Your feedback helps us grow and serve you better.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name *"
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email *"
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number *"
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <textarea
                required
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="About your experience *"
                className="w-full border border-gray-300 p-3 rounded h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-400 text-black font-semibold py-3 rounded hover:bg-blue-500 transition"
              >
                SEND
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: Chart or Illustration */}
        <div className="md:w-1/2 bg-blue-50 flex justify-center items-center p-4">
          <FeedbackSide />
        </div>
      </div>
    </div>
  );
};

export default Feedback;
