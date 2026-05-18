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
    // Optimistically transition state instantly for a premium SaaS feel
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await axios.put(`${API_BASE}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    } catch (err) {
      console.warn('[NOTIF] Syncing read state with backend failed (likely out-of-sync database):', err.message);
    }
  };

  const markAllRead = async () => {
    // Optimistically mark all read immediately
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await axios.put(`${API_BASE}/read-all`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    } catch (err) {
      console.warn('[NOTIF] Syncing read-all state with backend failed:', err.message);
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
    }
  };

  const deleteNotification = async (id) => {
    // Save original state in case of a non-404 network failure
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;

    // Optimistically remove notification instantly
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => {
      const wasUnread = notifications.find(n => n.id === id && !n.is_read);
      return wasUnread ? Math.max(0, prev - 1) : prev;
    });

    try {
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    } catch (err) {
      console.warn('[NOTIF] Syncing deletion with backend failed:', err.message);
      // Revert only if it is a real server error (not a 404 indicating it's already gone)
      if (err.response && err.response.status !== 404) {
        setNotifications(originalNotifications);
        setUnreadCount(originalUnreadCount);
      }
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
