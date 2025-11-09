// src/pages/Home.jsx
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-16 md:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-3 md:mb-6 tracking-tight leading-snug"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Find <span className="text-yellow-200">Trusted</span>
            <br />
            <span className="text-cyan-200">Local Experts</span> Near You
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-6 md:mb-8 font-light leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Book professional services for home, repairs, tutoring, and more with confidence
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4"
          >
            <Link
              to="/services"
              className="bg-yellow-400 text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-lg hover:bg-yellow-500 transition transform hover:scale-105"
            >
              Browse Services
            </Link>
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Become a Provider
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="py-12 md:py-20 bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-12 md:mb-16 text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <motion.div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center border border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="text-blue-600 mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white">
                  <span className="text-2xl font-black">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Find a Service</h3>
              <p className="text-gray-700">Browse services by category or search for what you need.</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center border border-purple-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <div className="text-purple-600 mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 text-white">
                  <span className="text-2xl font-black">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Book Instantly</h3>
              <p className="text-gray-700">Select a provider and book with a few clicks.</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center border border-pink-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="text-pink-600 mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600 text-white">
                  <span className="text-2xl font-black">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Get It Done</h3>
              <p className="text-gray-700">Your provider arrives and completes the job professionally.</p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Popular Services */}
      <div className="py-12 md:py-20 bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-12 md:mb-16 text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Popular Services</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'Plumbing', icon: '🚿' },
              { name: 'Electrical', icon: '💡' },
              { name: 'Cleaning', icon: '🧹' },
              { name: 'Tutoring', icon: '📚' },
              { name: 'Repairs', icon: '🔧' },
              { name: 'Painting', icon: '🎨' },
              { name: 'Carpentry', icon: '🪵' },
              { name: 'Gardening', icon: '🌿' },
            ].map((service, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-xl transition cursor-pointer border border-gray-100"
                whileHover={{ y: -8, scale: 1.05 }}
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{service.name}</h3>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8 md:mt-12">
            <Link 
              to="/categories" 
              className="inline-block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-bold hover:shadow-lg transition transform hover:scale-105"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Browse All Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
