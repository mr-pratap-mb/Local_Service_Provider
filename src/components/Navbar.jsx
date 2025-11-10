import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../api/supabaseClient";
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, profile, loading, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("id", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err.message);
    }
  }

  return (
    <header className="bg-indigo-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          <Link to="/" className="text-lg md:text-2xl font-bold text-white">LocalService</Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showDropdown ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-1">
            <Link to="/" className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition">Home</Link>
            
            <div className="relative group">
              <Link to="/services" className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition flex items-center">
                Services
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                <div className="px-4 py-2 text-gray-900 font-medium text-sm">Filter by Category</div>
                <div className="border-t border-gray-100 my-2"></div>
                {categories.map(cat => (
                  <Link 
                    key={cat.id} 
                    to={`/categories/${cat.id}`} 
                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 text-sm"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {user ? (
              <>
                <Link 
                  to={profile?.role === 'provider' ? "/provider-dashboard" : "/user-dashboard"} 
                  className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Dashboard
                </Link>

                {profile?.role === 'provider' && (
                  <Link 
                    to="/addservice" 
                    className="text-white hover:bg-green-600 bg-green-500 px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    + Add Service
                  </Link>
                )}

                <NotificationBell />

                <button 
                  onClick={logout}
                  className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>

                <span className="text-indigo-100 font-medium bg-white bg-opacity-20 rounded-md px-3 py-2 text-sm">
                  {profile?.full_name || user.email}
                </span>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition">Login</Link>
                <Link to="/signup" className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition">Sign Up</Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {showDropdown && (
          <div className="md:hidden bg-indigo-700 rounded-lg mt-2 mb-4 py-4 px-4 space-y-2">
            <Link 
              to="/" 
              className="block text-white hover:bg-indigo-600 rounded-md px-3 py-2 transition"
              onClick={() => setShowDropdown(false)}
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="block text-white hover:bg-indigo-600 rounded-md px-3 py-2 transition"
              onClick={() => setShowDropdown(false)}
            >
              Services
            </Link>
            {categories.length > 0 && (
              <div className="pl-4 space-y-1">
                <div className="text-indigo-200 text-sm font-medium">Categories:</div>
                {categories.slice(0, 5).map(cat => (
                  <Link 
                    key={cat.id} 
                    to={`/categories/${cat.id}`} 
                    className="block text-indigo-100 hover:bg-indigo-600 rounded-md px-3 py-1 text-sm transition"
                    onClick={() => setShowDropdown(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
            {user ? (
              <>
                <Link 
                  to={profile?.role === 'provider' ? "/provider-dashboard" : "/user-dashboard"} 
                  className="block text-white hover:bg-indigo-600 rounded-md px-3 py-2 transition"
                  onClick={() => setShowDropdown(false)}
                >
                  Dashboard
                </Link>
                {profile?.role === 'provider' && (
                  <Link 
                    to="/addservice" 
                    className="block text-white hover:bg-green-600 bg-green-500 rounded-md px-3 py-2 transition font-medium"
                    onClick={() => setShowDropdown(false)}
                  >
                    + Add Service
                  </Link>
                )}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-indigo-100 text-sm">
                    {profile?.full_name || user.email}
                  </span>
                  <NotificationBell />
                </div>
                <button 
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="block w-full text-left text-white hover:bg-indigo-600 rounded-md px-3 py-2 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block text-white hover:bg-indigo-600 rounded-md px-3 py-2 transition"
                  onClick={() => setShowDropdown(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block text-white hover:bg-indigo-600 rounded-md px-3 py-2 transition"
                  onClick={() => setShowDropdown(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}