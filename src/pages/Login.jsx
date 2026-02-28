import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [formData, setFormData] = useState({
    warehouse_code: '',
    password: ''
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
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user);

        setShowSuccessPopup(true);
        
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/');
        }, 1500);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Server error');
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg flex flex-col md:flex-row overflow-hidden">

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12 space-y-5">
          <h2 className="text-2xl font-bold">LOGIN</h2>

          <input
            type="text"
            name="warehouse_code"
            placeholder="Warehouse Code"
            value={formData.warehouse_code}
            onChange={handleChange}
            className="w-full p-3 border rounded bg-blue-50 outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border rounded bg-blue-50 outline-none"
            required
          />

          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-900 transition"
          >
            Login Now
          </button>

          <p className="text-center text-sm">
            Don’t have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium">
              Sign up
            </Link>
          </p>
        </form>

        {/* ✅ Success Popup (Top Center) */}
        {showSuccessPopup && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
            <div className="bg-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
              <span className="text-xl">✅</span>
              <p className="font-semibold">Login Successful</p>
            </div>
          </div>
        )}

        {/* Illustration */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
          <img src="/assets/home.png" alt="home" />
        </div>
      </div>
    </div>
  );
};

export default Login;
