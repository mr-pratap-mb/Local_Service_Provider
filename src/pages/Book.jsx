import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scheduledDate, setScheduledDate] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [anyMessage, setAnyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setLoading(true);
      setError('');

      // Fetch service to get provider_id
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('provider_id, id')
        .eq('id', id)
        .single();

      if (serviceError) throw serviceError;
      if (!serviceData) throw new Error('Service not found');

      // Insert booking
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            provider_id: serviceData.provider_id,
            service_id: id,
            scheduled_date: scheduledDate,
            status: 'pending',
            category_id: id, // Assuming category_id is same as service_id for simplicity, adjust if needed
            detailedAddress: detailedAddress || '',
            anyMessage: anyMessage || ''
          }
        ])
        .select();

      if (error) throw error;

      alert('Booking successful! You will be notified when the provider responds.');
      navigate('/user-dashboard');
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to create booking: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 mobile-padding">
      <div className="responsive-form mx-auto bg-white mobile-padding md:p-8 rounded-lg shadow-md">
        <h2 className="responsive-text-2xl font-bold mb-4 md:mb-6 text-gray-800 mobile-text-center">Book Service</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleBooking}>
          <div className="mb-4">
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
          <div className="mb-4">
            <label htmlFor="detailedAddress" className="block text-gray-700 font-medium mb-2">
              Detailed Address (optional)
            </label>
            <input
              type="text"
              id="detailedAddress"
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Flat no., landmark, etc."
            />
          </div>
          <div className="mb-4">
            <label htmlFor="anyMessage" className="block text-gray-700 font-medium mb-2">
              Message to Provider (optional)
            </label>
            <textarea
              id="anyMessage"
              value={anyMessage}
              onChange={(e) => setAnyMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="E.g., Please bring a ladder"
              rows="3"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {loading ? 'Booking...' : 'Book Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
