// src/App.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 text-center flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold text-purple-700 mb-6">
        Find Trusted Local Experts Near You
      </h1>
      <p className="text-lg text-gray-700 mb-8 max-w-xl">
        Book top-rated electricians, plumbers, tutors, and more — all verified
        and ready to help you anytime.
      </p>
      <Link
        to="/categories"
        className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-purple-700 transition"
      >
        Browse Services
      </Link>
    </div>
  );
}
