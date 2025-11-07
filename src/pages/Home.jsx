// src/pages/Home.jsx
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white overflow-hidden">

      {/* Background floating circles */}
      <motion.div
        className="absolute w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
        animate={{ x: [0, 50, -50, 0], y: [0, 30, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
        animate={{ x: [0, -60, 60, 0], y: [0, -40, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight mb-4"
        >
          Find <span className="text-yellow-300">Trusted Local Experts</span> <br />
          Near You
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-8"
        >
          Get reliable services for plumbing, repairs, tutoring, cleaning, and more — all from your neighborhood.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <Link
            to="/services"
            className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition-transform"
          >
            Get Started
          </Link>
        </motion.div>
      </div>

      {/* Wave at bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#ffffff"
          fillOpacity="1"
          d="M0,256L60,245.3C120,235,240,213,360,202.7C480,192,600,192,720,176C840,160,960,128,1080,122.7C1200,117,1320,139,1380,149.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        ></path>
      </svg>
    </div>
  )
}
