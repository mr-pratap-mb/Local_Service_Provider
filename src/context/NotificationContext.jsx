// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();

    // Subscribe to real-time changes
    const setupSubscription = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userData.user.id}`
        }, (payload) => {
          console.log('New notification:', payload);
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
          // Play notification sound
          playNotificationSound();
        })
        .subscribe();

      return subscription;
    };

    let subscription;
    setupSubscription().then(sub => subscription = sub);

    // Clean up subscription on unmount
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', userData.user.id)
        .eq('read', false);

      if (error) throw error;
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const playNotificationSound = () => {
    // Simple browser notification sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
    audio.play().catch(err => console.error('Audio play error:', err));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
