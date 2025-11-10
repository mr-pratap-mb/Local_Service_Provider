import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* About / Credits */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">About / Credits</h3>
            <p className="text-sm text-gray-400 mb-3">Made at SGBIT College, Belagavi, Karnataka – 2025</p>
            <p className="text-sm font-medium">Created by:</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="text-red-500">Pratap Bambadi</li>
              <li className="text-red-500">Preetam Hiremath</li>
              <li className="text-red-500">Shashank Kumbar</li>
              <li className="text-red-500">Yogesh Kulkarni</li>
            </ul>
            <p className="mt-3 text-sm"><span className="font-medium text-gray-300">Guided By:</span> <span className="text-red-500">Prof. Shrinivas Dhotre</span></p>
          </div>

          {/* Quick Links (dummy) */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Home</a></li>
              <li><a href="#" className="hover:text-white transition">Services</a></li>
              <li><a href="#" className="hover:text-white transition">Bookings</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">About</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm">
              <li>📧 Email: <a href="mailto:LocalServiceProvider215@gmail.com" className="hover:text-white transition">LocalServiceProvider215@gmail.com</a></li>
              <li>📍 Location: Belagavi, Karnataka</li>
            </ul>
          </div>

          {/* Social Links (dummy) */}
          <div>
            <h4 className="text-white font-semibold mb-4">Social</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © 2025 Local Service Provider App. All Rights Reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}