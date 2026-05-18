/**
 * src/services/socket.js — Production-ready Socket.IO Client Service
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_TICKET_API_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
    this.currentToken = null;
  }

  connect(token) {
    if (!token) {
      console.warn('[SOCKET] Connection aborted: no authentication token provided');
      return null;
    }

    // Reuse the existing active instance if the token is identical
    if (this.socket) {
      if (this.currentToken === token && this.socket.connected) {
        console.log('[SOCKET] Reusing active socket instance.');
        return this.socket;
      }
      this.disconnect();
    }

    this.currentToken = token;
    console.log('[SOCKET] Establishing production connection with transport fallback support...');

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // Dual transport fallback as required
      reconnection: true,
      reconnectionAttempts: 5, // Reconnect attempts limit
      reconnectionDelay: 2000,
      timeout: 20000, // 20-second timeout as required
      autoConnect: false, // Ensure autoConnect is false
      withCredentials: true, // Handle cross-origin cookies correctly
      auth: {
        token
      },
      query: { token: `Bearer ${token}` } // Legacy setup compatibility
    });

    this.socket.on('connect', () => {
      console.log('[SOCKET] Connection established successfully. Current Transport:', this.socket.io.engine.transport.name);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected from host:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[SOCKET] Connection warning:', err.message);
    });

    // Manually trigger connect since autoConnect is false
    this.socket.connect();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('[SOCKET] Purging and disconnecting current connection instance.');
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
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
