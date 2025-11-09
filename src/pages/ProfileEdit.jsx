// src/pages/ProfileEdit.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

export default function ProfileEdit() {
  const [profile, setProfile] = useState(null)
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const { data: ud } = await supabase.auth.getUser()
    const uid = ud?.user?.id
    if (!uid) return
    const { data } = await supabase.from('profiles').select('id, full_name, phone, role').eq('id', uid).single()
    setProfile(data)
    setPhone(data?.phone || '')
  }

  async function save() {
    const { data: ud } = await supabase.auth.getUser()
    const uid = ud?.user?.id
    const { error } = await supabase.from('profiles').update({ phone }).eq('id', uid)
    if (error) setMsg('Save error: ' + error.message)
    else setMsg('Saved!')
  }

  if (!profile) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
          
          <div className="mb-6">
            <div className="text-gray-700 font-medium mb-1">Name</div>
            <div className="text-lg font-semibold">{profile.full_name}</div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Phone (for WhatsApp)
            </label>
            <input 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. 919999999999"
            />
          </div>
          
          <button 
            onClick={save}
            className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
          
          {msg && (
            <div className={`mt-6 p-4 rounded-lg text-center ${msg.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
