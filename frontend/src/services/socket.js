/**
 * src/services/socket.js — Socket.IO Client Service
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_TICKET_API_URL || 'http://localhost:5001'; // Ticket Service URL

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      query: { token: `Bearer ${token}` }, // Fallback for some middleware setups
      transports: ['websocket'], // Force WebSocket transport only to bypass sticky-session requirements on cloud platforms
      timeout: 60000, // Keep connection timeout at 60s for Render cold-starts
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('[SOCKET] Connected to server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[SOCKET] Connection error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }
}

export const socketService = new SocketService();
