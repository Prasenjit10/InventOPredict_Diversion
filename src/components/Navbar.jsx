import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaUserCircle } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-50 shadow-md px-4 sm:px-6 lg:px-10 py-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="z-50">
          <div className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="Logo" className="h-10 w-10 rounded-xl" />
            <h1 className="text-xl font-bold text-gray-800">
              Invent<span className="text-blue-500">O</span>
              <span className="text-blue-500">Predict</span>
            </h1>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex flex-1 justify-center gap-8 text-sm font-medium text-gray-700">
          <Link className="hover:text-blue-500" to="/">Home</Link>
          <Link className="hover:text-blue-500" to="/analysis">Analysis</Link>
          <Link className="hover:text-blue-500" to="/about">About</Link>
          <Link className="hover:text-blue-500" to="/contactus">Contact Us</Link>
          <Link className="hover:text-blue-500" to="/feedback">Feedback</Link>
        </div>

        {/* Desktop Right */}
        <div className="hidden lg:block relative">
          {!user ? (
            <Link to="/login">
              <button className="bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg text-sm font-medium">
                Login / Register
              </button>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow hover:shadow-md transition"
              >
                <FaUserCircle size={26} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user.company_name}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-xl border overflow-hidden">
                  <div className="px-4 py-3 bg-blue-500 text-white">
                    <p className="text-sm font-semibold">{user.company_name}</p>
                    <p className="text-xs opacity-90">{user.company_code}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden z-50">
          <button onClick={() => setMenuOpen(true)}>
            <HiMenu size={26} />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar (Half Screen) */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-[75%] max-w-sm bg-white z-50
        transform transition-all duration-300 ease-out
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button onClick={() => setMenuOpen(false)}>
            <HiX size={24} />
          </button>
        </div>

        {/* Mobile Links */}
        <div className="px-6 py-6 flex flex-col gap-5 text-gray-700 font-medium">
          <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-blue-500">Home</Link>
          <Link to="/analysis" onClick={() => setMenuOpen(false)} className="hover:text-blue-500">Analysis</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="hover:text-blue-500">About</Link>
          <Link to="/contactus" onClick={() => setMenuOpen(false)} className="hover:text-blue-500">Contact Us</Link>
          <Link to="/feedback" onClick={() => setMenuOpen(false)} className="hover:text-blue-500">Feedback</Link>

          <div className="mt-6 border-t pt-5">
            {!user ? (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <button className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600">
                  Login / Register
                </button>
              </Link>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  {user.company_name}
                </p>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-red-600 py-2.5 rounded-lg hover:bg-red-50"
                >
                  <FiLogOut />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
