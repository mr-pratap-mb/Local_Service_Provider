// src/pages/ProviderDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;
    async function init() {
      const { data } = await supabase.auth.getUser();
      const providerId = data?.user?.id;
      if (!providerId) { setLoading(false); return; }

      await fetchServices(providerId);
      await fetchBookings(providerId);

      channel = supabase
        .channel("provider-" + providerId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `provider_id=eq.${providerId}` }, () => {
          fetchBookings(providerId);
        })
        .subscribe();
    }
    init();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  async function fetchServices(providerId) {
    const { data } = await supabase.from("services").select('id, title, category_id').eq('provider_id', providerId);
    setServices(data || []);
  }

  async function fetchBookings(providerId) {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, status, created_at,
        services (title),
        users:user_id (full_name, email, phone)
      `)
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setBookings(data || []);
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    if (error) alert("Update failed: " + error.message);
    else {
      // success; fetchBookings will be triggered by realtime subscription
    }
  }

  if (loading) return <div className="p-10 text-purple-700">Loading bookings...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-purple-700 mb-6">Provider Dashboard</h2>

      <section className="mb-6">
        <h3 className="font-semibold mb-3">Your Services</h3>
        {services.length === 0 ? <p className="text-gray-600">No services yet</p> : (
          <ul className="space-y-2">
            {services.map(s => <li key={s.id} className="bg-white p-3 rounded shadow-sm">{s.title}</li>)}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-semibold mb-3">Bookings</h3>
        {bookings.length === 0 ? <p className="text-gray-600">No bookings yet.</p> : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
                <div>
                  <div className="font-semibold">{b.services?.title}</div>
                  <div className="text-sm text-gray-600">From: {b.users?.full_name || b.users?.email}</div>
                  <div className="text-xs text-gray-500">Booked: {new Date(b.created_at).toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div>Status: <strong>{b.status}</strong></div>
                  {b.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(b.id, 'accepted')} className="bg-green-600 text-white px-3 py-1 rounded">Accept</button>
                      <button onClick={() => updateStatus(b.id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                    </>
                  )}
                  {b.status === "accepted" && <div className="text-green-700 font-medium">Accepted</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
