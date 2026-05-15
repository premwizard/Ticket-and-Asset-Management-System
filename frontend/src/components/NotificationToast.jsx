/**
 * src/components/NotificationToast.jsx — Animated toast for new signals
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, X, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function NotificationToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Expose global function to trigger toast
    window.showNotificationToast = (notif) => {
      setToast(notif);
      // Auto-dismiss after 5 seconds
      setTimeout(() => setToast(null), 5000);
    };

    return () => {
      delete window.showNotificationToast;
    };
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed bottom-10 right-10 z-[1000] w-96 bg-slate-900 text-white rounded-[32px] shadow-2xl border border-white/10 overflow-hidden cursor-pointer"
          onClick={() => setToast(null)}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <div className="p-6 flex gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">New Signal</h4>
                <X size={14} className="text-slate-500 hover:text-white" />
              </div>
              <p className="text-base font-bold truncate">{toast.title}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{toast.message}</p>
            </div>
          </div>
          <div className="h-1 bg-white/5 relative overflow-hidden">
             <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="absolute inset-0 bg-indigo-500" 
             />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
