// src/pages/Login.jsx
import React, { useState } from "react";
import { supabase } from "../api/supabaseClient";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const user = data?.user;
      if (!user) {
        alert("Login failed.");
        setLoading(false);
        return;
      }

      if (!user.email_confirmed_at) {
        await supabase.auth.signOut();
        alert("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        const meta = user.user_metadata || {};
        await supabase.from("profiles").insert([
          {
            id: user.id,
            full_name: meta.full_name || "",
            email: user.email,
            role: meta.role || "user",
          },
        ]);
      }

      alert("Login successful!");
      window.location.href = "/";
    } catch (err) {
      alert("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-6">
      <div className="w-full max-w-md bg-white shadow-lg p-8 rounded-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-purple-700 text-center mb-6">
          Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-purple-600 hover:underline font-semibold"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
