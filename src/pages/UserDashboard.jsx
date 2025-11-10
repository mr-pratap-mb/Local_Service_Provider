import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    console.log('UserDashboard mounting for user:', user.id);

    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching profile for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          throw error;
        }

        if (data.role !== 'user') {
          console.log('User role not matched, redirecting to provider dashboard');
          navigate('/provider-dashboard');
          return;
        }
        
        setProfile(data);
        console.log('Profile fetched successfully:', data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // Immediately fetch dashboard data on mount
    fetchDashboardDataWithRetry();
    // Check local storage flag for forced refresh
    const refreshFlag = localStorage.getItem('refreshUserDashboard');
    if (refreshFlag) {
      console.log('Forced refresh triggered by flag:', refreshFlag);
      localStorage.removeItem('refreshUserDashboard');
      fetchDashboardDataWithRetry();
    }
    
    // Subscribe to real-time booking updates early
    console.log('Initializing subscription for user bookings');
    const unsubscribe = subscribeToBookings();
    return () => {
      console.log('Cleaning up subscription');
      if (unsubscribe) unsubscribe();
    };
  }, [user, navigate]);

  const fetchDashboardDataWithRetry = async (retryCount = 3, delay = 1000) => {
    for (let i = 0; i < retryCount; i++) {
      try {
        setLoading(true);
        console.log(`Fetching bookings for user: ${user.id} (Attempt ${i + 1}/${retryCount})`);
        // Fetch base booking rows first (avoid relationship selects)
        const { data: rows, error: qErr } = await supabase
          .from('bookings')
          .select('id, user_id, provider_id, service_id, scheduled_date, status, detailedaddress, anymessage, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (qErr) {
          console.error('Error fetching bookings:', qErr);
          throw qErr;
        }

        let enriched = rows || [];
        if (enriched.length > 0) {
          const providerIds = [...new Set(enriched.map(b => b.provider_id).filter(Boolean))];
          const serviceIds = [...new Set(enriched.map(b => b.service_id).filter(Boolean))];

          let providerMap = {};
          let serviceMap = {};

          // Fetch providers and services in parallel for speed
          const promises = [];
          if (providerIds.length > 0) {
            promises.push(
              supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', providerIds)
            );
          } else {
            promises.push(Promise.resolve({ data: [], error: null }));
          }
          if (serviceIds.length > 0) {
            promises.push(
              supabase
                .from('services')
                .select('id, title')
                .in('id', serviceIds)
            );
          } else {
            promises.push(Promise.resolve({ data: [], error: null }));
          }

        const [providersRes, servicesRes] = await Promise.all(promises);
        const providersData = providersRes.data || [];
        const providersErr = providersRes.error;
        const servicesData = servicesRes.data || [];
        const servicesErr = servicesRes.error;

        if (providersErr) console.error('Error fetching providers for bookings:', providersErr);
        if (servicesErr) console.error('Error fetching services for bookings:', servicesErr);

        providerMap = Object.fromEntries(providersData.map(p => [p.id, p]));
        serviceMap = Object.fromEntries(servicesData.map(s => [s.id, s]));

        enriched = enriched.map(b => ({
          ...b,
          provider: providerMap[b.provider_id] || null,
          service: serviceMap[b.service_id] || null,
        }));
        }

        console.log('Bookings fetched (enriched):', enriched);
        setBookings(enriched);
        return; // Success, exit retry loop
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setBookings([]);
        if (i < retryCount - 1) {
          console.log(`Retrying fetch after delay of ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } finally {
        if (i === retryCount - 1) {
          setLoading(false);
        }
      }
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
        fetchDashboardDataWithRetry(); // Refresh data on booking update
      })
      .on('broadcast', { event: 'refresh_bookings' }, (payload) => {
        console.log('Broadcast refresh received:', payload);
        fetchDashboardDataWithRetry(); // Refresh data on broadcast
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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Your Dashboard</h2>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Your Bookings</h3>
          {bookings.length === 0 ? (
            <div className="text-gray-500 text-center py-6">No bookings yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {bookings.map(booking => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-base">{booking.service?.title || 'Service'}</h4>
                      <p className="text-sm text-gray-600">Provider: {booking.provider?.full_name || booking.provider?.email || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Date: {new Date(booking.scheduled_date).toLocaleString()}</p>
                      
                      {booking.detailedaddress && (
                        <p className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                          <strong>📍 Location:</strong> {booking.detailedaddress}
                        </p>
                      )}
                      
                      {booking.anymessage && (
                        <p className="text-sm text-gray-600 mt-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                          <strong>💬 Message:</strong> {booking.anymessage}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => window.location.href = '/services'}
            className="mt-6 w-full sm:w-auto bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
          >
            Book a Service
          </button>
        </div>
      </div>
    </div>
  );
}
