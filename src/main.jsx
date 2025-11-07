// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import ServiceDetail from "./pages/ServiceDetail";
import AddService from "./pages/AddService";
import ProviderDashboard from "./pages/ProviderDashboard";
import UserDashboard from "./pages/UserDashboard";
import Navbar from "./components/Navbar";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext"; // ✅ new import
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 🔹 Wrap with AuthProvider first, then NotificationProvider */}
      <AuthProvider>
        <NotificationProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:id" element={<CategoryDetail />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/addservice" element={<AddService />} />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
