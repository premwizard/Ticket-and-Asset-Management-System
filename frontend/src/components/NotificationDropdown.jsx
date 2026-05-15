/**
 * src/components/NotificationDropdown.jsx
 * 
 * Professional SaaS Notification Feed
 * Features: High-density signal monitoring, refined telemetry indicators, and clean interaction flow.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Clock, X, Info, AlertTriangle, AlertCircle, Zap, Activity } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Card, Badge, Button, cn } from './ui';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'ticket_new': return <Zap className="text-neutral-900 dark:text-neutral-100" size={14} />;
      case 'warning': return <AlertTriangle className="text-neutral-900 dark:text-neutral-100" size={14} />;
      case 'error': return <AlertCircle className="text-neutral-900 dark:text-neutral-100" size={14} />;
      default: return <Bell className="text-neutral-400" size={14} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-9 h-9 flex items-center justify-center rounded-md transition-all",
          isOpen 
            ? "bg-neutral-950 text-white dark:bg-white dark:text-black" 
            : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
        )}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-black dark:bg-white text-[9px] font-bold text-white dark:text-black border-2 border-white dark:border-neutral-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-widest">Signal Feed</h4>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{unreadCount} Pending Alerts</p>
              </div>
              <button 
                onClick={markAllRead}
                className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-3 space-y-2">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    className={cn(
                      "p-3 rounded-lg border flex gap-3 transition-all relative group",
                      n.is_read 
                        ? "bg-transparent border-transparent opacity-50" 
                        : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-100 dark:border-neutral-800"
                    )}
                  >
                    <div className="w-8 h-8 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center flex-shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate leading-tight">{n.title}</p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Activity size={10} className="text-neutral-300" />
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.is_read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="w-7 h-7 rounded-md bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-80 transition-all"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-neutral-200 dark:text-neutral-700 mb-3">
                    <Bell size={24} />
                  </div>
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Signal Buffer Clear</p>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-neutral-50/50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800">
               <button className="w-full text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                 Operational History
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
