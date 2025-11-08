// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchProfile(uid) {
    if (!uid) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, email, phone")
      .eq("id", uid)
      .single();
    if (error) {
      console.error("fetchProfile error", error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
  }

  useEffect(() => {
    let active = true;
    async function init() {
      const { data } = await supabase.auth.getUser();
      const u = data?.user || null;
      if (active) {
        setUser(u);
        if (u?.id) await fetchProfile(u.id);
        setLoading(false);
      }
    }
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user || null;
      setUser(newUser);
      if (newUser?.id) {
        fetchProfile(newUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setProfile(null);
      navigate("/");
    }
  };

  const value = { user, profile, loading, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
