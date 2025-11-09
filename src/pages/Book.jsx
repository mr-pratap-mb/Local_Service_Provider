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
      service_id: categoryId,
      category_id: categoryId,
      notes,
      status: 'pending',
      scheduled_date: new Date().toISOString()
    }

    const { error } = await supabase.from('bookings').insert([booking])
    if (error) setMsg('Booking failed: ' + error.message)
    else {
      setMsg('Booking request sent. Provider will be notified.')
      setTimeout(() => navigate('/user-dashboard'), 1200)
    }
  }

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Book {providerName}
          </h2>
          
          <form onSubmit={handleBook} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Notes for Provider (Optional)
              </label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Please bring extra tools"
                className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 transition"
            >
              Send Booking Request
            </button>
          </form>
          
          {msg && (
            <div className={`mt-6 p-4 rounded-lg text-center ${msg.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
