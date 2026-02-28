import React from "react";
import { FaInstagram, FaFacebook, FaEnvelope, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="bg-blue-100 border-t-2 border-slate-300 px-4 sm:px-6 md:px-16 py-10 text-sm font-roboto">
      <div className="max-w-7xl mx-auto flex flex-col gap-12 md:flex-row md:justify-between">
        {/* Left Section */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <img
              src="https://img.icons8.com/ios-filled/50/000000/combo-chart.png"
              alt="logo"
              className="w-7 h-7"
            />
            <Link to="/">
              <span>
                Invent<span className="text-blue-800">O<span className="text-blue-800">Predict</span></span>
              </span>
            </Link>
          </div>

          <div className="flex gap-4 text-lg text-gray-700">
            <a
              href="#"
              aria-label="Instagram"
              className="transition-all hover:text-pink-500" // Instagram pink
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="transition-all hover:text-[#1877F2]" // Facebook blue
            >
              <FaFacebook />
            </a>
            <a
              href="#"
              aria-label="Email"
              className="transition-all hover:text-red-500" // Gmail red
            >
              <FaEnvelope />
            </a>
            <a
              href="#"
              aria-label="Phone"
              className="transition-all hover:text-green-500" // Phone green
            >
              <FaPhone />
            </a>
          </div>

          <div className="text-xs text-gray-600 mt-2 text-center md:text-left">
            © 2025 All rights reserved
          </div>
        </div>

        {/* Middle Columns */}
        <div className="flex flex-col sm:flex-row gap-10 justify-center items-center md:items-start text-center md:text-left">
          <div className="flex flex-col gap-1 min-w-[120px]">
            <h4 className="font-bold text-base mb-1">Quick Links</h4>
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/about" className="hover:underline">
              About
            </Link>
            <Link to="/feedback" className="hover:underline">
              Feedback
            </Link>
          </div>
          <div className="flex flex-col gap-1 min-w-[160px]">
            <h4 className="font-bold text-base mb-1">Features</h4>
            <Link to="#" className="hover:underline">
              Stock Operation Data
            </Link>
            <Link to="#" className="hover:underline">
              AI Forecast Tool
            </Link>
            <Link to="#" className="hover:underline">
              Visual Insights
            </Link>
          </div>
          <div className="flex flex-col gap-1 min-w-[140px]">
            <h4 className="font-bold text-base mb-1">External Links</h4>

            <Link to="#" className="hover:underline">
              Documentation
            </Link>
            <Link to="#" className="hover:underline">
              GitHub Repository
            </Link>
          </div>
        </div>

        {/* Right Section: Slogan */}
        <div className="text-center md:text-right font-mono text-indigo-600 text-2xl md:text-3xl leading-relaxed italic tracking-wide">
          Predict.
          <br />
          Prepare.
          <br />
          Perform.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
