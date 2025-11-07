// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../api/supabaseClient'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUser()
    const { data: sub } = supabase.auth.onAuthStateChange(() => fetchUser())
    return () => sub.subscription?.unsubscribe?.()
  }, [])

  async function fetchUser() {
    try {
      const { data } = await supabase.auth.getUser()
      const u = data?.user || null
      setUser(u)
      if (u?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', u.id)
          .single()
        setProfile(prof || null)
      } else {
        setProfile(null)
      }
    } catch (err) {
      console.error(err)
      setUser(null); setProfile(null)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
    navigate('/')
  }

  return (
    <header className="bg-white shadow py-4 px-6 flex justify-between items-center sticky top-0 z-40">
      <Link to="/" className="text-2xl font-extrabold text-purple-700">Local Service</Link>

      <div className="flex items-center gap-4">
        <Link to="/categories" className="text-gray-700 hover:text-purple-700">Services</Link>

        {user && <NotificationBell />}

        {!user && (
          <>
            <Link to="/login" className="text-gray-700 hover:text-purple-700">Login</Link>
            <Link to="/signup" className="bg-purple-600 text-white px-4 py-2 rounded-lg">Sign Up</Link>
          </>
        )}

        {user && profile?.role === 'user' && (
          <>
            <Link to="/user-dashboard" className="text-gray-700 hover:text-purple-700">Dashboard</Link>
            <span className="text-gray-800 font-semibold">{profile?.full_name}</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded-md">Logout</button>
          </>
        )}

        {user && profile?.role === 'provider' && (
          <>
            <Link to="/addservice" className="text-gray-700 hover:text-purple-700">Add Service</Link>
            <Link to="/provider-dashboard" className="text-gray-700 hover:text-purple-700">Dashboard</Link>
            <span className="text-gray-800 font-semibold">{profile?.full_name}</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded-md">Logout</button>
          </>
        )}
      </div>
    </header>
  )
}
