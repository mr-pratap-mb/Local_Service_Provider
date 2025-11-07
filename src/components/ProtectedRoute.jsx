// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) {
          navigate("/login");
          return;
        }

        // ✅ Check if email confirmed
        if (!user.email_confirmed_at) {
          await supabase.auth.signOut();
          alert("Please verify your email before accessing this page.");
          navigate("/login");
          return;
        }

        // ✅ Fetch role from profile table
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          alert("Profile not found. Please complete signup.");
          await supabase.auth.signOut();
          navigate("/login");
          return;
        }

        if (!role || profile.role === role) {
          if (mounted) setAllowed(true);
        } else {
          alert("You don't have permission to view this page.");
          navigate("/");
        }
      } catch (err) {
        console.error("ProtectedRoute error:", err);
        navigate("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, [role, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-purple-700">
        Checking authentication...
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
