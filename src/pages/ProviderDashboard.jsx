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
        .select("*, service:service_id (title), user:user_id (email)")
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Provider Dashboard
        </h2>

        {loading ? (
          <div className="bg-white p-4 rounded shadow">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-4 rounded shadow text-gray-500">
            No bookings yet.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-lg">
                    {b.service?.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    Customer: {b.user?.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    Scheduled:{" "}
                    {b.scheduled_date
                      ? new Date(b.scheduled_date).toLocaleString()
                      : "N/A"}
                  </div>
                  <div className="text-sm">
                    Status:{" "}
                    <span className="font-medium capitalize">{b.status}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(b.id, "accepted")}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, "cancelled")}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.status === "accepted" && (
                    <button
                      onClick={() => updateStatus(b.id, "completed")}
                      className="px-3 py-1 bg-indigo-600 text-white rounded"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
