import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="responsive-container mobile-padding">
        {/* Main Footer Content */}
        <div className="responsive-grid">
          
          {/* About / Credits Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-100">About</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Created by:</p>
              <ul className="space-y-1 text-red-400">
                <li>- Pratap Bambadi</li>
                <li>- Preetam Hiremath</li>
                <li>- Shashank Kumbar</li>
                <li>- Yogesh Kulkarni</li>
              </ul>
              <p>Made at SGBIT College, Belagavi, Karnataka – 2025.</p>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-100">Quick Links</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link to="/" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">Home</Link>
              <Link to="/services" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">Services</Link>
              <Link to="/user-dashboard" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">Bookings</Link>
              <a href="#contact" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">Contact</a>
              <a href="#about" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">About</a>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-100">Contact Info</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div className="flex items-center space-x-2">
                <span>📧</span>
                <a href="mailto:localserviceprovider215@gmail.com" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">
                  localserviceprovider215@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>Belagavi, Karnataka</span>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-100">Follow Us</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <a href="#facebook" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">Facebook</a>
              <a href="#twitter" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">Twitter</a>
              <a href="#instagram" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">Instagram</a>
              <a href="#linkedin" className="text-indigo-300 hover:text-indigo-400 transition-colors duration-200">LinkedIn</a>
            </div>
          </div>
        </div>

        {/* Copyright Line */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="text-center text-sm text-gray-400">
            © 2025 Local Service Provider Web App. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;