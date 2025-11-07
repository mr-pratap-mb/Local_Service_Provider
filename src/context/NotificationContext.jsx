// src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

const NotificationContext = createContext()

export function useNotifications() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel = null

    async function init() {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) {
        setLoading(false)
        return
      }

      // fetch existing
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      setNotifications(data || [])
      setLoading(false)

      // realtime subscription
      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev])
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
          (payload) => {
            setNotifications((prev) => prev.map(n => n.id === payload.new.id ? payload.new : n))
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  async function markAsRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <NotificationContext.Provider value={{ notifications, loading, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}
