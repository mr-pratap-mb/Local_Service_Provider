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
        .select("*, service:service_id ( title ), provider:provider_id ( full_name )")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setBookings([]);
      } else if (mounted) {
        setBookings(data || []);
      }
      setLoading(false);
    }

    loadBookings();
    return () => { mounted = false; };
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Bookings</h2>
        {loading ? <div className="p-4 bg-white rounded-lg shadow">Loading bookings...</div> :
          bookings.length === 0 ? <div className="p-4 bg-white rounded-lg shadow text-gray-500">You haven't made any bookings yet.</div> :
            <div className="space-y-4">
              {bookings.map(b => (
                <div key={b.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">{b.service?.title || 'Service'}</div>
                    <div className="text-sm text-gray-600">Provider: {b.provider?.full_name || '—'}</div>
                    <div className="text-sm text-gray-600">Scheduled: {new Date(b.scheduled_date).toLocaleString()}</div>
                    <div className="text-sm">Status: <span className="font-medium">{b.status}</span></div>
                  </div>
                  <div className="flex gap-2">
                    {b.status === 'pending' && <button onClick={() => cancelBooking(b.id)} className="px-3 py-1 rounded bg-red-500 text-white">Cancel</button>}
                    <button onClick={() => navigate(`/services/${b.service_id}`)} className="px-3 py-1 rounded border">View</button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}
