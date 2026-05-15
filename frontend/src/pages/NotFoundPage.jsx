/**
 * src/pages/NotFoundPage.jsx
 * 
 * Professional SaaS 404 Error Interface
 * Features: Minimalist monochrome design, clean typography, and secure TicKas-grade feel.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, AlertCircle, ArrowLeft, ShieldAlert, Terminal } from 'lucide-react';
import { Button } from '../components/ui';

export default function NotFoundPage() {
   const navigate = useNavigate();

   return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-6 overflow-hidden relative">

         <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center relative z-10 max-w-lg"
         >
            <div className="relative inline-block mb-10">
               <div className="w-20 h-20 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black flex items-center justify-center shadow-xl mx-auto border border-neutral-800 dark:border-neutral-200">
                  <Compass size={40} />
               </div>
               <div className="absolute -top-3 -right-3 w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black shadow-lg border-2 border-white dark:border-neutral-950">
                  <AlertCircle size={14} />
               </div>
            </div>

            <h1 className="text-7xl font-bold text-neutral-900 dark:text-white leading-none mb-4">404</h1>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Location Synchrony Failure</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed mb-10 max-w-sm mx-auto">
               The requested resource identifier is either restricted, offline, or does not exist within the current operational sector.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
               <Button onClick={() => navigate('/')} className="w-full sm:w-auto h-11 px-8 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <Home size={14} />
                  Return to Core
               </Button>
               <Button variant="outline" onClick={() => navigate(-1)} className="w-full sm:w-auto h-11 px-8 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <ArrowLeft size={14} />
                  Revert Path
               </Button>
            </div>

            <div className="mt-16 pt-8 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-center gap-4">
               <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-neutral-300" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Protocol: 404_ERR</span>
               </div>
               <div className="w-1 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
               <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sector: Global</span>
            </div>
         </motion.div>
      </div>
   );
}
