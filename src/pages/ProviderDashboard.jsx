// src/pages/ProviderDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        .select("*, service:service_id (title), user:user_id (email, whatsapp_number, location, phone_number)")
        .eq("provider_id", userId)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      setBookings(data || []);
      setLoading(false);

      // Realtime listener
      channel = supabase
        .channel(`provider-bookings-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `provider_id=eq.${userId}`,
          },
          (payload) => {
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
        )
        .subscribe();
    }

    loadBookings();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Update failed: " + error.message);
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    }
  }

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Provider Dashboard</h2>
        
        {loading ? (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No bookings yet
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{b.service?.title}</h3>
                      <p className="text-gray-600 text-sm">Customer: {b.user?.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'accepted' ? 'bg-blue-100 text-blue-800' : b.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {b.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <div>Scheduled: {b.scheduled_date ? new Date(b.scheduled_date).toLocaleString() : 'N/A'}</div>
                  </div>
                  
                  {/* Show contact info when booking is accepted */}
                  {b.status === 'accepted' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Customer Contact Info</h4>
                      <p className="text-sm text-gray-600">WhatsApp: {b.user?.whatsapp_number || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Phone Number: {b.user?.phone_number || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Location: {b.user?.location || 'N/A'}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    {b.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(b.id, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => updateStatus(b.id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {b.status === 'accepted' && (
                      <button 
                        onClick={() => updateStatus(b.id, 'completed')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                      >
                        Mark Complete
                      </button>
                    )}
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
