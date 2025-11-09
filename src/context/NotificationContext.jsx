// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch initial notifications for this user
      const fetchNotifications = async () => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('recipient_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching notifications:', error);
            return;
          }

          setNotifications(data || []);
          setUnreadCount(data.filter(n => !n.read).length);
        } catch (err) {
          console.error('Unexpected error fetching notifications:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();

      // Subscribe to real-time changes for this user only
      const subscription = supabase
        .channel(`notifications:${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        }, (payload) => {
          console.log('New notification received:', payload);
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
          // Play sound for new notification
          const audio = new Audio('/notification.mp3');
          audio.play().catch(err => console.error('Audio play error:', err));
        })
        .subscribe();

      return () => subscription.unsubscribe();
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('recipient_id', user?.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
      );
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user?.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Unexpected error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
