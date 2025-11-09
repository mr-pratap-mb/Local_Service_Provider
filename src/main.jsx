// src/main.jsx
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import LoadingScreen from "./components/LoadingScreen";
import "./index.css";

// lazy pages
const App = lazy(() => import("./App"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Categories = lazy(() => import("./pages/Categories"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const AddService = lazy(() => import("./pages/AddService"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Services = lazy(() => import("./pages/Services"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/Local_Service_Provider">
      <AuthProvider>
        <NotificationProvider>
          <Layout>
            <Suspense fallback={<LoadingScreen message="Preparing app..." />}>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:id" element={<CategoryDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/addservice" element={<AddService />} />
                <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
              </Routes>
            </Suspense>
          </Layout>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
