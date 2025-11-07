// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;
    async function init() {
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id;
      if (!uid) { setLoading(false); return; }
      await fetchBookings(uid);

      channel = supabase
        .channel('user-' + uid)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${uid}` }, () => {
          fetchBookings(uid);
        })
        .subscribe();
    }
    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  async function fetchBookings(uid) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, status, created_at,
        services (title, hidden_details),
        providers:provider_id (full_name, phone, email)
      `)
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setBookings(data || []);
    setLoading(false);
  }

  if (loading) return <div className="p-10 text-purple-700">Loading your bookings...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-purple-700 mb-6">My Bookings</h2>
      {bookings.length === 0 ? <p className="text-gray-600">You have no bookings yet.</p> : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white p-4 rounded shadow-sm">
              <div className="font-semibold text-lg">{b.services?.title}</div>
              <div className="text-sm text-gray-600">Booked: {new Date(b.created_at).toLocaleString()}</div>
              <div className="mt-2">Status: <strong>{b.status}</strong></div>
              {b.status === "accepted" && (
                <div className="mt-2 text-green-700">
                  Provider Contact: {b.providers?.phone ? (
                    <a className="underline text-blue-600" href={`https://wa.me/${b.providers.phone}`} target="_blank" rel="noreferrer">{b.providers.phone}</a>
                  ) : (b.providers?.email || "N/A")}
                </div>
              )}
              {b.status === "rejected" && <div className="mt-2 text-red-600">Request rejected by provider</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
