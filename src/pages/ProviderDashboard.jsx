import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function ProviderDashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      subscribeToBookings();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch provider's services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch bookings for provider's services
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, user:user_id(full_name, email), service:service_id(title)')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToBookings = () => {
    const subscription = supabase
      .channel(`provider_bookings:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `provider_id=eq.${user.id}`
      }, (payload) => {
        console.log('New booking received:', payload);
        fetchDashboardData(); // Refresh data on new booking
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .eq('provider_id', user.id);

      if (error) {
        if (error.code === '23503') {
          alert('Cannot reject a booking that has already been accepted or completed.');
        } else {
          console.error('Error updating booking status:', error);
          alert(`Failed to update booking status: ${error.message}`);
        }
        return;
      }
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      alert(`Booking ${newStatus} successfully`);
    } catch (err) {
      console.error('Unexpected error updating booking status:', err);
      alert('Failed to update booking status due to an unexpected error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6 text-center">
        <div className="text-gray-600 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!profile || profile.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6 text-center">
        <div className="text-red-600 text-lg">Access denied. Provider role required.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 mobile-padding">
      <div className="responsive-container">
        <h2 className="responsive-text-2xl font-bold mb-4 md:mb-6 text-gray-800 mobile-text-center">Provider Dashboard</h2>
        <div className="dashboard-grid">
          <div className="responsive-card bg-white rounded-lg shadow-md border border-gray-100">
            <h3 className="responsive-text-xl font-semibold mb-4 text-gray-700">Your Services</h3>
            {services.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No services created yet.</div>
            ) : (
              <div className="space-y-4">
                {services.map(service => (
                  <div key={service.id} className="border-b border-gray-100 pb-3">
                    <h4 className="font-medium text-gray-900">{service.title}</h4>
                    <p className="text-sm text-gray-600">₹{service.price}</p>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => window.location.href = '/addservice'}
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Add New Service
            </button>
          </div>

          <div className="responsive-card bg-white rounded-lg shadow-md border border-gray-100">
            <h3 className="responsive-text-xl font-semibold mb-4 text-gray-700">Booking Requests</h3>
            {bookings.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No bookings yet.</div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="border-b border-gray-100 pb-3">
                    <h4 className="font-medium text-gray-900">{booking.service?.title || 'Service'}</h4>
                    <p className="text-sm text-gray-600">User: {booking.user?.full_name || booking.user?.email || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(booking.scheduled_date).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Status: {booking.status}</p>
                    {booking.detailedAddress && (
                      <p className="text-sm text-gray-600">Detailed Address: {booking.detailedAddress}</p>
                    )}
                    {booking.anyMessage && (
                      <p className="text-sm text-gray-600">Message: {booking.anyMessage}</p>
                    )}
                    {booking.status === 'pending' && (
                      <div className="mt-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'accepted')}
                          className="responsive-button bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="responsive-button bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {booking.status === 'accepted' && (
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="responsive-button mt-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
