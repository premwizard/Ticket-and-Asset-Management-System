/**
 * src/context/NotificationContext.jsx — Real-time Notifications State
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';
import axios from 'axios';

const NotificationContext = createContext(null);

const API_BASE = `${import.meta.env.VITE_TICKET_API_URL || 'http://localhost:5001'}/notifications`;

export const NotificationProvider = ({ children }) => {
  const { session, user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('[NOTIF] Fetch error:', err);
    }
  }, [session]);

  useEffect(() => {
    if (session?.access_token) {
      // Connect socket
      const socket = socketService.connect(session.access_token);
      
      // Fetch initial notifications
      fetchNotifications();

      // Listen for new notifications
      const handleNewNotification = (notif) => {
        console.log('[SOCKET] Received notification:', notif);
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast logic can go here or be handled by a separate toast listener
        if (window.showNotificationToast) {
          window.showNotificationToast(notif);
        }
      };

      socketService.on('new_notification', handleNewNotification);

      return () => {
        socketService.off('new_notification', handleNewNotification);
        socketService.disconnect();
      };
    }
  }, [session, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[NOTIF] Mark read error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_BASE}/read-all`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[NOTIF] Mark all read error:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Re-calculate unread count if needed
      setUnreadCount(prev => {
        const wasUnread = notifications.find(n => n.id === id && !n.is_read);
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      console.error('[NOTIF] Delete error:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllRead,
      deleteNotification,
      refresh: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};
