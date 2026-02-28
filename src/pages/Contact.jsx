import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/Contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    alert(result.message);
    setForm({ name: '', email: '', message: '' });
  } catch (error) {
    alert("Error sending message!");
  }
};

  return (
    <div className="pt-24 min-h-screen bg-white px-6 py-10 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6 text-center">Get in Touch</h1>
      <p className="text-center text-gray-600 max-w-xl mb-8">
        We'd love to hear from you — whether it's a question, suggestion, or just feedback about your experience using SmartStock Predictor.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl space-y-5 bg-gray-50 p-8 rounded shadow"
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name *"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email *"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <textarea
          name="message"
          rows="5"
          placeholder="Your Message *"
          required
          value={form.message}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-semibold w-full"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;
