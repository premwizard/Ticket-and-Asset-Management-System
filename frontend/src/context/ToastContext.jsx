/**
 * src/context/ToastContext.jsx
 *
 * Provides a lightweight notification system (Toasts) for the application.
 * Replaces standard browser alerts with modern, non-blocking UI notifications.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = (msg) => addToast(msg, 'success');
  const error   = (msg) => addToast(msg, 'error');
  const info    = (msg) => addToast(msg, 'info');

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto px-5 py-3 rounded-xl shadow-2xl border flex items-center justify-between gap-4 
              animate-in slide-in-from-right-10 fade-in duration-300
              ${toast.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : ''}
              ${toast.type === 'error'   ? 'bg-red-50 border-red-100 text-red-800' : ''}
              ${toast.type === 'info'    ? 'bg-blue-50 border-blue-100 text-blue-800' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'info' && 'ℹ️'}
              </span>
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
