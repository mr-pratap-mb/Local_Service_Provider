// src/components/BookingForm.jsx
import React, { useState } from "react";
import { supabase } from "../api/supabaseClient";
import dayjs from "dayjs";

export default function BookingForm({ serviceId, providerId, onBooked }) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) throw new Error("You must be logged in.");

      const userId = userData.user.id;

      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: userId,
            provider_id: providerId,
            service_id: serviceId,
            scheduled_date: dayjs(scheduledDate).toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      alert("✅ Booking successful!");
      onBooked?.(data);
    } catch (err) {
      alert("Booking failed: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-gray-700">
          Choose Date & Time
        </span>
        <input
          type="datetime-local"
          required
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 p-2"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
      >
        {loading ? "Booking..." : "Book Now"}
      </button>
    </form>
  );
}
