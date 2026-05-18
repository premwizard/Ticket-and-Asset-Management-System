/**
 * src/context/NotificationContext.jsx — Real-time Notifications State
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';
import axios from 'axios';

const NotificationContext = createContext(null);

const API_BASE = `${import.meta.env.VITE_TICKET_API_URL || 'http://localhost:5001'}/notifications`;

export const NotificationProvider = ({ children }) => {
  const { session, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const tokenRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
      setHasLoaded(true);
    } catch (err) {
      console.error('[NOTIF] Fetch error:', err);
    }
  }, [session?.access_token]);

  useEffect(() => {
    // Only connect socket and load data after the user is authenticated and token is available
    if (isAuthenticated && session?.access_token) {
      const currentToken = session.access_token;
      
      // Prevent reconnect storm if the token did not change
      if (tokenRef.current === currentToken) return;
      tokenRef.current = currentToken;

      console.log('[NOTIF] Authenticated session resolved, establishing lazy socket...');
      
      // Keep track of active listener cleanup
      let cleanupListener = null;

      // Lazy load: Defer socket connection and fetch to keep the initial dashboard render ultra-fast
      const lazyTimer = setTimeout(() => {
        const socket = socketService.connect(currentToken);

        if (socket) {
          const handleNewNotification = (notif) => {
            console.log('[SOCKET] Received notification:', notif);
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
            if (window.showNotificationToast) {
              window.showNotificationToast(notif);
            }
          };

          socketService.on('new_notification', handleNewNotification);
          cleanupListener = () => {
            socketService.off('new_notification', handleNewNotification);
          };
        }
      }, 500); // 500ms delay gives high priority to dashboard load first

      // Defer notification list fetch to non-blocking cycle
      const fetchTimer = setTimeout(() => {
        fetchNotifications();
      }, 800);

      return () => {
        clearTimeout(lazyTimer);
        clearTimeout(fetchTimer);
        if (cleanupListener) {
          cleanupListener();
        }
      };
    } else {
      // Disconnect socket cleanly on logout or unmount
      if (tokenRef.current) {
        console.log('[NOTIF] User logged out, cleaning up socket connection...');
        socketService.disconnect();
        tokenRef.current = null;
        setNotifications([]);
        setUnreadCount(0);
        setHasLoaded(false);
      }
    }
  }, [isAuthenticated, session?.access_token, fetchNotifications]);

  const markAsRead = async (id) => {
    // Optimistic UI state transition
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await axios.put(`${API_BASE}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    } catch (err) {
      console.warn('[NOTIF] Syncing read state failed:', err.message);
    }
  };

  const markAllRead = async () => {
    // Optimistic UI state transition
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await axios.put(`${API_BASE}/read-all`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
    } catch (err) {
      console.warn('[NOTIF] Syncing read-all failed:', err.message);
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
    }
  };

  const deleteNotification = async (id) => {
    // Optimistic UI state transition
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;

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
      console.warn('[NOTIF] Syncing deletion failed:', err.message);
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
      hasLoaded,
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
