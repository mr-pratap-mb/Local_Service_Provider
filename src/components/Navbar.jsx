// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, profile, loading, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-40">
      <Link to="/" className="text-2xl font-extrabold text-purple-700">
        Local Service
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/categories" className="text-gray-700 hover:text-purple-700">
          Services
        </Link>

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
