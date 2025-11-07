// src/pages/Services.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../api/supabaseClient'

export default function Services() {
  const [services, setServices] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    // Get all available services with provider info
    const { data, error } = await supabase
      .from('services')
      .select('*, provider:provider_id(full_name, phone)')
      .order('created_at', { ascending: false })

    if (error) {
      setMsg('Error loading services: ' + error.message)
    } else {
      setServices(data || [])
    }
  }

  async function bookService(serviceId) {
    setMsg('Processing booking...')
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      setMsg('Please login first.')
      return
    }

    const userId = userData.user.id
    const { error } = await supabase
      .from('bookings')
      .insert([{ user_id: userId, service_id: serviceId, status: 'pending' }])

    if (error) {
      setMsg('Booking error: ' + error.message)
    } else {
      setMsg('Booking request sent successfully!')
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Available Services</h2>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {services.length === 0 ? (
        <p>No services found.</p>
      ) : (
        services.map(service => (
          <div
            key={service.id}
            style={{
              border: '1px solid #ccc',
              margin: '1rem',
              padding: '1rem',
              borderRadius: '10px'
            }}
          >
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <p><b>Price:</b> ₹{service.price}</p>
            <p><b>Location:</b> {service.location}</p>
            <p><b>Provider:</b> {service.provider?.full_name || 'Unknown'}</p>
            <button onClick={() => bookService(service)}>Book</button>
          </div>
        ))
      )}
    </div>
  )
}
