// src/components/Navbar.jsx
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
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-white">LocalService</Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/" className="text-white hover:bg-indigo-700 hover:bg-opacity-30 border border-transparent rounded-md px-3 py-1 transition-colors duration-200">Home</Link>
            </li>
            <li>
              <div className="relative group">
                <Link to="/services" className="flex items-center text-white hover:bg-indigo-700 hover:bg-opacity-30 border border-transparent rounded-md px-3 py-1 transition-colors duration-200">
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
            </li>
            {user ? (
              <>
                <li>
                  {profile?.role === 'provider' ? (
                    <Link to="/provider-dashboard" className="text-white hover:bg-indigo-700 hover:bg-opacity-30 border border-transparent rounded-md px-3 py-1 transition-colors duration-200">Dashboard</Link>
                  ) : (
                    <Link to="/user-dashboard" className="text-white hover:bg-indigo-700 hover:bg-opacity-30 border border-transparent rounded-md px-3 py-1 transition-colors duration-200">Dashboard</Link>
                  )}
                </li>
                {profile?.role === 'provider' && (
                  <li>
                    <Link to="/addservice" className="text-white hover:bg-indigo-700 hover:bg-opacity-30 border border-transparent rounded-md px-3 py-1 transition-colors duration-200">Add Service</Link>
                  </li>
                )}
                <li>
                  <NotificationBell />
                </li>
                <li>
                  <button 
                    onClick={logout}
                    className="text-white hover:bg-indigo-700 hover:bg-opacity-30 border border-transparent rounded-md px-3 py-1 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </li>
                <li>
                  <span className="text-indigo-100 font-medium bg-white bg-opacity-20 border border-indigo-200 rounded-md px-3 py-1 hidden md:inline">
                    {profile?.full_name || user.email}
                  </span>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="text-white hover:bg-indigo-700 hover:bg-opacity-30 border border-transparent rounded-md px-3 py-1 transition-colors duration-200">Login</Link></li>
                <li><Link to="/signup" className="text-white hover:bg-indigo-700 hover:bg-opacity-30 border border-transparent rounded-md px-3 py-1 transition-colors duration-200">Sign Up</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
