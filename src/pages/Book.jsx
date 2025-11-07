// src/pages/Book.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../api/supabaseClient'

export default function Book() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [msg, setMsg] = useState('')

  if (!state) return <div className="p-6">No provider selected.</div>

  const { providerId, providerName, categoryId } = state

  async function handleBook(e) {
    e.preventDefault()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) { setMsg('Please login to book.'); navigate('/login'); return }

    const booking = {
      user_id: user.id,
      provider_id: providerId,
      category_id: categoryId,
      notes,
      status: 'pending'
    }

    const { error } = await supabase.from('bookings').insert([booking])
    if (error) setMsg('Booking failed: ' + error.message)
    else {
      setMsg('Booking request sent. Provider will be notified.')
      setTimeout(() => navigate('/user-dashboard'), 1200)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-3">Book {providerName}</h2>
      <form onSubmit={handleBook} className="space-y-3">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes for provider (optional)" className="w-full border p-2 rounded" />
        <button className="bg-purple-600 text-white px-4 py-2 rounded">Send Booking Request</button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  )
}
