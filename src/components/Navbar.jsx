// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../api/supabaseClient";

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
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-40">
      <Link to="/" className="text-2xl font-extrabold text-purple-700">
        Local Service
      </Link>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <Link 
            to="/services"
            className="text-gray-700 hover:text-purple-700 font-medium flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition"
          >
            Services
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </Link>
          
          {/* Dropdown Menu */}
          <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
            <div className="px-4 py-2 text-gray-900 font-medium text-sm">
              Filter by Category
            </div>
            <div className="border-t border-gray-100 my-2"></div>
            {categories.map((cat) => (
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

        {loading ? (
          <div className="text-gray-500 text-sm">Loading...</div>
        ) : !user ? (
          <>
            <Link to="/login" className="text-gray-700 hover:text-purple-700">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              Sign Up
            </Link>
          </>
        ) : profile?.role === "provider" ? (
          <>
            <Link to="/addservice" className="text-gray-700 hover:text-purple-700">
              Add Service
            </Link>
            <Link
              to="/provider-dashboard"
              className="text-gray-700 hover:text-purple-700"
            >
              Dashboard
            </Link>
            <span className="text-gray-800 font-semibold capitalize">
              {profile?.full_name || "Provider"}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded-md"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/user-dashboard" className="text-gray-700 hover:text-purple-700">
              Dashboard
            </Link>
            <span className="text-gray-800 font-semibold capitalize">
              {profile?.full_name || "User"}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded-md"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
