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
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <div className="mb-3">Name: <strong>{profile.full_name}</strong></div>
      <div className="mb-3">
        <label className="block text-sm">Phone (for WhatsApp)</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. 919999999999" />
      </div>
      <button onClick={save} className="bg-purple-600 text-white px-4 py-2 rounded">Save</button>
      {msg && <p className="mt-3">{msg}</p>}
    </div>
  )
}
