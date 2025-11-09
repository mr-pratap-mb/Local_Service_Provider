import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={toggleDropdown}
        className="relative focus:outline-none md:h-10 md:w-10 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

          {notifications.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.slice(0, 10).map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 hover:bg-gray-50 flex justify-between items-start ${notification.read ? 'opacity-75' : 'bg-blue-50'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate md:text-base">
                      {notification.type === 'booking_request' ? 'New Booking Request' : 'Booking Update'}
                    </p>
                    <p className="text-xs text-gray-500 truncate md:text-sm">
                      {notification.payload?.booking_id || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 md:text-sm">
                      {new Date(notification.created_at).toLocaleTimeString()}
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
