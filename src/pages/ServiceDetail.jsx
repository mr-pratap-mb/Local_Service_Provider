// src/pages/ServiceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [anyMessage, setAnyMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select("id, title, description, price, provider_id, category_id, location")
          .eq("id", id)
          .single();

        if (serviceError) {
          console.error("Error fetching service:", serviceError);
          setError(`Failed to load service: ${serviceError.message}`);
          setService(null);
        } else if (!serviceData) {
          setError("Service not found. It may have been removed or does not exist.");
          setService(null);
        } else {
          // Fetch provider data separately
          const { data: providerData, error: providerError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("id", serviceData.provider_id)
            .single();

          if (providerError) {
            console.error("Error fetching provider:", providerError);
            setService({
              ...serviceData,
              provider: { full_name: "Professional Provider" }
            });
          } else {
            setService({
              ...serviceData,
              provider: providerData
            });
          }
          setError('');
        }
      } catch (err) {
        console.error("Unexpected error fetching service:", err);
        setError(`Unexpected error: ${err.message}`);
        setService(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!scheduledDate) {
      setError('Please select a date and time for your booking.');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');

      // Insert booking with all details
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            provider_id: service.provider_id,
            service_id: id,
            scheduled_date: scheduledDate,
            status: 'pending',
            category_id: service.category_id,
            detailedaddress: detailedAddress || '',
            anymessage: anyMessage || ''
          }
        ])
        .select();

      if (error) throw error;

      // Send notification to provider
      if (data && data.length > 0) {
        const booking = data[0];
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              recipient_id: service.provider_id,
              title: 'Booking Request',
              content: `${user.full_name || 'A user'} has requested a booking for ${service.title || 'your service'} scheduled on ${scheduledDate ? new Date(scheduledDate).toLocaleString() : 'N/A'}. New Booking Request ID: ${booking.id}`,
              type: 'new_booking',
              is_read: false
            }
          ]);

        if (notificationError) {
          console.error('Error sending notification to provider:', notificationError);
        }
      }

      // Trigger a broadcast to refresh dashboards (if supported by Supabase channel)
      await supabase.channel(`user_bookings:${user.id}`).send({
        type: 'broadcast',
        event: 'refresh_bookings',
        payload: { user_id: user.id }
      });

      await supabase.channel(`bookings:provider:${service.provider_id}`).send({
        type: 'broadcast',
        event: 'refresh_bookings',
        payload: { provider_id: service.provider_id }
      });

      // Set a local storage flag to force refresh on User Dashboard
      localStorage.setItem('refreshUserDashboard', Date.now().toString());

      alert('Booking successful! You will be notified when the provider responds.');
      // Add a slight delay to ensure broadcast is processed before navigation
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 500);
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to create booking: ' + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-purple-700">Loading service...</div>
    );

  if (!service)
    return (
      <div className="p-10 text-center text-gray-600">{error || "Service not found."}</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div>
              <div className="h-80 bg-gray-100 rounded-xl overflow-hidden mb-6">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                  <span className="text-gray-500 font-medium">Service Image</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {service.title}
              </h1>
              <p className="text-gray-700 mb-6">
                {service.description}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xl font-bold text-indigo-600">₹{service.price}</span>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">{service.location || 'Multiple locations'}</span>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-600">
                    {service.provider?.full_name || 'Professional Provider'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Book this Service</h3>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label htmlFor="scheduledDate" className="block text-gray-700 font-medium mb-2">
                    Select Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledDate"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                {/* Optional Fields Section */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">📝</span>
                    Additional Information (Optional)
                  </h4>
                  
                  <div className="mb-3">
                    <label htmlFor="detailedAddress" className="block text-sm text-gray-700 font-medium mb-1 flex items-center">
                      <span className="mr-1">📍</span>
                      Detailed Address
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
                    </label>
                    <input
                      type="text"
                      id="detailedAddress"
                      value={detailedAddress}
                      onChange={(e) => setDetailedAddress(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Flat no., building name, landmark..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="anyMessage" className="block text-sm text-gray-700 font-medium mb-1 flex items-center">
                      <span className="mr-1">💬</span>
                      Message to Provider
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
                    </label>
                    <textarea
                      id="anyMessage"
                      value={anyMessage}
                      onChange={(e) => setAnyMessage(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Special instructions or requirements..."
                      rows="2"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className={`w-full py-3 rounded-lg font-medium transition ${bookingLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {bookingLoading ? 'Booking...' : 'Book Now'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
