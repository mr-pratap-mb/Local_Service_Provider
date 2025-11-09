import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { supabase } from '../api/supabaseClient';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [enhancedNotifications, setEnhancedNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Enhance notifications with user and service data
  useEffect(() => {
    const fetchEnhancedData = async () => {
      const updatedNotifications = await Promise.all(notifications.map(async (notif) => {
        let userName = 'Unknown User';
        let providerName = 'Unknown Provider';
        let serviceTitle = 'Unknown Service';

        // Fetch sender (user or provider) name
        if (notif.sender_id) {
          const { data: userData, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', notif.sender_id)
            .single();

          if (!error && userData) {
            userName = userData.full_name || `User ${notif.sender_id.substring(0, 8)}`;
            providerName = userData.full_name || `Provider ${notif.sender_id.substring(0, 8)}`;
          }
        }

        // Fetch service title if available
        if (notif.payload?.service_id) {
          const { data: serviceData, error } = await supabase
            .from('services')
            .select('title')
            .eq('id', notif.payload.service_id)
            .single();

          if (!error && serviceData) {
            serviceTitle = serviceData.title || `Service #${notif.payload.service_id}`;
          }
        }

        return {
          ...notif,
          userName,
          providerName,
          serviceTitle
        };
      }));

      setEnhancedNotifications(updatedNotifications);
    };

    if (notifications.length > 0) {
      fetchEnhancedData();
    } else {
      setEnhancedNotifications([]);
    }
  }, [notifications]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative focus:outline-none md:h-10 md:w-10 flex items-center justify-center transform transition-transform duration-200 hover:scale-110 bg-indigo-700 bg-opacity-30 rounded-full p-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400 hover:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center md:h-6 md:w-6 md:-top-2 md:-right-2">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto md:w-96 md:max-h-[80vh]">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 md:text-sm"
              >
                Mark all as read
              </button>
            )}
          </div>

          {enhancedNotifications.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {enhancedNotifications.slice(0, 10).map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 hover:bg-gray-50 flex justify-between items-start ${notification.read ? 'opacity-75' : 'bg-blue-50'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate md:text-base">
                      {notification.type === 'booking_request' 
                        ? 'New Booking Request' 
                        : 'Booking Status Update'}
                    </p>
                    <p className="text-xs text-gray-500 truncate md:text-sm">
                      {notification.type === 'booking_request' 
                        ? `${notification.serviceTitle} booked by ${notification.userName} at ${new Date(notification.created_at).toLocaleTimeString()}` 
                        : `${notification.serviceTitle} ${notification.payload?.status || 'updated'} by ${notification.providerName} at ${new Date(notification.created_at).toLocaleTimeString()}`}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 md:text-sm"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
