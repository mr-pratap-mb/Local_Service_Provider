import React from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-hero-gradient text-platinum font-sans">
      {/* 🔹 Animated gradient background */}
      <motion.div
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: "100% 50%" }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_200%]"
      />

      {/* 🔹 Subtle light overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-gray-800/10 to-gray-900/10 opacity-30 -z-10" />

      <Navbar />
      <main className="pt-20 fade-in">{children}</main>
    </div>
  );
}
