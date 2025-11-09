import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
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
      // Fetch user's bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, provider:provider_id(full_name, email), service:service_id(title)')
        .eq('user_id', user.id)
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
      .channel(`user_bookings:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Booking update received:', payload);
        fetchDashboardData(); // Refresh data on booking update
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6 text-center">
        <div className="text-gray-600 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!profile || profile.role !== 'user') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6 text-center">
        <div className="text-red-600 text-lg">Access denied. User role required.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">User Dashboard</h2>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Bookings</h3>
          {bookings.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No bookings yet.</div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-gray-900">{booking.service?.title || 'Service'}</h4>
                  <p className="text-sm text-gray-600">Provider: {booking.provider?.full_name || booking.provider?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(booking.scheduled_date).toLocaleString()}</p>
                  <p className={`text-sm font-medium ${booking.status === 'accepted' ? 'text-green-600' : booking.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>
                    Status: {booking.status}
                  </p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => window.location.href = '/services'}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Book a Service
          </button>
        </div>
      </div>
    </div>
  );
}
