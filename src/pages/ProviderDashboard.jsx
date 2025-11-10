import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  // If we've already loaded once in this session, don't show the page spinner again
  useEffect(() => {
    if (sessionStorage.getItem('providerDashBoot') === '1') {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);

        if (data.role !== 'provider') {
          navigate('/user-dashboard');
          return;
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const fetchServicesAndBookings = async (retryCount = 3, delay = 1000) => {
    for (let i = 0; i < retryCount; i++) {
      try {
        setLoading(true);
        console.log(`Fetching data for provider: ${user.id} (Attempt ${i + 1}/${retryCount})`);
        
        // Fetch provider services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', user.id);

        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        // Fetch bookings for provider - show all statuses to maintain history
        const { data: bookingRows, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, user_id, provider_id, service_id, scheduled_date, status, detailedaddress, anymessage, created_at')
          .eq('provider_id', user.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;

        let enriched = bookingRows || [];
        if (enriched.length > 0) {
          const userIds = [...new Set(enriched.map(b => b.user_id).filter(Boolean))];
          const serviceIds = [...new Set(enriched.map(b => b.service_id).filter(Boolean))];

          let userMap = {};
          let serviceMap = {};

          if (userIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .in('id', userIds);
            if (usersError) {
              console.error('Error fetching users for bookings:', usersError);
            } else if (usersData) {
              userMap = Object.fromEntries(usersData.map(u => [u.id, u]));
            }
          }

          if (serviceIds.length > 0) {
            const { data: servicesData, error: servicesErr } = await supabase
              .from('services')
              .select('id, title')
              .in('id', serviceIds);
            if (servicesErr) {
              console.error('Error fetching services for bookings:', servicesErr);
            } else if (servicesData) {
              serviceMap = Object.fromEntries(servicesData.map(s => [s.id, s]));
            }
          }

          enriched = enriched.map(b => ({
            ...b,
            user: userMap[b.user_id] || null,
            service: serviceMap[b.service_id] || null,
          }));
        }

        console.log('Bookings fetched for provider (enriched):', enriched);
        setBookings(enriched);
        return; // Success, exit retry loop
      } catch (err) {
        console.error('Error fetching data:', err);
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

  useEffect(() => {
    if (profile && profile.role === 'provider') {
      let mounted = true;
      // Fetch data on component mount, but don't block UI after first load
      fetchServicesAndBookings().finally(() => {
        if (mounted) setPageLoading(false);
        sessionStorage.setItem('providerDashBoot', '1');
      });

      // Real-time subscription for new bookings and updates
      const subscription = supabase
        .channel(`bookings:provider:${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `provider_id=eq.${user.id}`
        }, async (payload) => {
          console.log('Booking update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const [userRes, serviceRes] = await Promise.all([
              supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('id', payload.new.user_id)
                .single(),
              supabase
                .from('services')
                .select('id, title')
                .eq('id', payload.new.service_id)
                .single()
            ]);

            const userData = userRes.data;
            const userError = userRes.error;
            const serviceData = serviceRes.data;
            const serviceError = serviceRes.error;

            if (userError) console.error('Error fetching user data:', userError);
            if (serviceError) console.error('Error fetching service data:', serviceError);

            setBookings(prev => {
              const exists = prev.some(b => b.id === payload.new.id);
              if (exists) return prev;
              const newBooking = {
                ...payload.new,
                user: userData || { full_name: 'Unknown User' },
                service: serviceData || { title: 'Unknown Service' }
              };
              console.log('Adding new booking to state:', newBooking);
              return [newBooking, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setBookings(prev => {
              const updatedBookings = prev.map(b => b.id === payload.new.id ? { ...b, ...payload.new, user: b.user, service: b.service } : b);
              console.log('Updated bookings state:', updatedBookings);
              return updatedBookings;
            });
          }
        })
        .on('broadcast', { event: 'refresh_bookings' }, (payload) => {
          console.log('Broadcast refresh received:', payload);
          fetchServicesAndBookings(); // Refresh data on broadcast
        })
        .subscribe();

      return () => { mounted = false; subscription.unsubscribe(); };
    }
  }, [profile, user]);

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .eq('provider_id', user.id);

      if (error) {
        console.error('Error updating booking status:', error);
        alert(`Failed to update booking status: ${error.message}`);
        return;
      }
      
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      alert(`Booking ${newStatus} successfully`);

      // Send notification to user
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([
            {
              recipient_id: booking.user_id,
              title: `Booking ${newStatus}`,
              content: `${booking.provider?.full_name || 'Provider'} has ${newStatus} your booking for ${booking.service?.title || 'a service'} scheduled on ${booking.scheduled_date ? new Date(booking.scheduled_date).toLocaleString() : 'N/A'}. New Booking Request ID: ${booking.id}`,
              type: 'booking_status',
              is_read: false
            }
          ]);

        if (notificationError) {
          console.error('Error sending notification:', notificationError);
        }
      }
    } catch (err) {
      console.error('Unexpected error updating booking status:', err);
      alert('Failed to update booking status due to an unexpected error');
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-gray-600 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!profile || profile.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-red-600 text-lg">Access denied. Provider role required.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Add Service Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {profile?.full_name || 'Provider'}</p>
          </div>
          <Link 
            to="/addservice" 
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium text-center"
          >
            + Add Service
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Services Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Your Services</h2>
            {services.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <p>No services added yet.</p>
                <Link to="/addservice" className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block">
                  Add your first service →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map(service => (
                  <div key={service.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h3 className="font-semibold text-gray-900 text-lg">{service.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                    <p className="text-green-600 font-semibold mt-2">₹{service.price}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Requests Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Booking Requests</h2>
            {bookings.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <p>No bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookings.map(booking => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{booking.service?.title || 'Service'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      <strong>User:</strong> {booking.user?.full_name || booking.user?.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Date:</strong> {new Date(booking.scheduled_date).toLocaleString()}
                    </p>
                    
                    {booking.detailedaddress && (
                      <p className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        <strong>📍 Address:</strong> {booking.detailedaddress}
                      </p>
                    )}
                    
                    {booking.anymessage && (
                      <p className="text-sm text-gray-600 mt-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                        <strong>💬 Message:</strong> {booking.anymessage}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'accepted')}
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="w-full bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 transition font-medium"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
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