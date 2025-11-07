// src/App.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-purple-700">Local Service App</h1>
        <p className="mt-4 text-gray-600">Find local providers near you.</p>
        <div className="mt-6">
          <Link to="/categories" className="bg-purple-600 text-white px-4 py-2 rounded">Browse Categories</Link>
        </div>
      </div>
    </div>
  )
}
