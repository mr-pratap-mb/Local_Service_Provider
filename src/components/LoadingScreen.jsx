// src/components/LoadingScreen.jsx
import React from "react";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
        <div className="mt-4 text-gray-600">{message}</div>
      </div>
    </div>
  );
}
