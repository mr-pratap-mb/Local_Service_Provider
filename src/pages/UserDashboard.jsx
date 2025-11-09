// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let channel = null;

    async function loadBookings() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*, service:service_id ( title ), provider:provider_id ( full_name, whatsapp_number, location, email, phone_number )")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setBookings([]);
      } else if (mounted) {
        setBookings(data || []);
      }
      setLoading(false);

      // Real-time listener for user bookings
      channel = supabase
        .channel(`user-bookings-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (mounted) {
              setBookings((prev) => {
                const exists = prev.find((b) => b.id === payload.new.id);
                if (payload.eventType === "INSERT") {
                  return exists ? prev : [payload.new, ...prev];
                }
                if (payload.eventType === "UPDATE") {
                  return prev.map((b) =>
                    b.id === payload.new.id ? payload.new : b
                  );
                }
                return prev;
              });
            }
          }
        )
        .subscribe();
    }

    loadBookings();
    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function cancelBooking(id) {
    const confirmCancel = window.confirm("Do you really want to cancel this booking?");
    if (!confirmCancel) return;

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) alert("Cancel failed: " + error.message);
    else setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
  }

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Bookings</h2>
        
        {loading ? (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            You haven't made any bookings yet
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{b.service?.title || 'Service'}</h3>
                      <p className="text-gray-600 text-sm">Provider: {b.provider?.full_name || '—'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'accepted' ? 'bg-blue-100 text-blue-800' : b.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {b.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <div>Scheduled: {new Date(b.scheduled_date).toLocaleString()}</div>
                  </div>
                  
                  {/* Show contact info when booking is accepted */}
                  {b.status === 'accepted' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Provider Contact Info</h4>
                      <p className="text-sm text-gray-600">WhatsApp: {b.provider?.whatsapp_number || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Location: {b.provider?.location || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Email: {b.provider?.email || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Phone Number: {b.provider?.phone_number || 'N/A'}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    {b.status === 'pending' && (
                      <button 
                        onClick={() => cancelBooking(b.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                      >
                        Cancel Booking
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/services/${b.service_id}`)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      View Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
