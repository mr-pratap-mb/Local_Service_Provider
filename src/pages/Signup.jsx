// src/pages/Signup.jsx
import React, { useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // 1️⃣ Create Auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      const user = data?.user;
      if (!user?.id) throw new Error("No user returned from signup");

      // 2️⃣ Insert profile row
      const { error: profErr } = await supabase.from("profiles").insert([
        {
          id: user.id,
          full_name: fullName,
          email: user.email,
          role,
        },
      ]);
      if (profErr) throw profErr;

      alert("Signup successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border rounded-md p-2"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-md p-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="user">User</option>
              <option value="provider">Provider</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
