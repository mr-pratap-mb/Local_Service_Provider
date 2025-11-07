// src/components/NotificationBell.jsx
import React, { useState } from 'react'
import { useNotifications } from '../context/NotificationContext'

export default function NotificationBell() {
  const { notifications, loading, markAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-2 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">{unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded shadow-lg z-50">
          <div className="p-3 flex items-center justify-between border-b">
            <div className="font-semibold">Notifications</div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? <div className="p-3">Loading...</div> :
              notifications.length === 0 ? <div className="p-3">No notifications</div> :
                notifications.map(n => (
                  <div key={n.id} className={`p-3 border-b ${n.read ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className="text-sm font-medium">{n.type}</div>
                    <div className="text-xs text-gray-600 mt-1">{n.payload ? JSON.stringify(n.payload) : ''}</div>
                    {!n.read && <button onClick={() => markAsRead(n.id)} className="mt-2 text-xs text-indigo-600">Mark read</button>}
                  </div>
                ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
