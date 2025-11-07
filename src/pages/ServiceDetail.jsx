// src/pages/ServiceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import BookingForm from "../components/BookingForm";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("services")
        .select("*, provider:provider_id ( id, full_name )")
        .eq("id", id)
        .single();
      if (error) console.error(error);
      setService(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center text-purple-700">Loading service...</div>
    );

  if (!service)
    return (
      <div className="p-10 text-center text-gray-600">Service not found.</div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-purple-700 mb-2">
              {service.title}
            </h1>
            <p className="text-gray-700 mb-2">{service.description}</p>
            <p className="text-indigo-600 font-semibold mb-1">
              ₹{service.price}
            </p>
            <p className="text-sm text-gray-500">
              Provider: {service.provider?.full_name || "—"}
            </p>
          </div>

          {/* ✅ Booking Form */}
          <div className="w-full md:w-96 bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">
              Book this Service
            </h3>
            <BookingForm
              serviceId={service.id}
              providerId={service.provider_id}
              onBooked={() => {
                alert("Booking created!");
                navigate("/user-dashboard");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
