/**
 * src/pages/LoginPage.jsx
 * 
 * Professional SaaS Authentication Interface
 * Features: Minimalist monochrome design, clean typography, and secure TicKas-grade feel.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Command, Sparkles, Activity, ShieldCheck, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Badge } from '../components/ui';

export default function LoginPage() {
   const { signIn, user } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      if (user) navigate('/dashboard', { replace: true });
   }, [user, navigate]);

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      try {
         await signIn(email.trim(), password);
         navigate('/dashboard', { replace: true });
      } catch (err) {
         setError(err.message || 'Authentication failed. Please check your credentials.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-neutral-950">

         <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Marketing Side */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block space-y-8">
               <div className="space-y-4">
                  <Badge variant="outline" className="text-neutral-500 border-neutral-200 dark:border-neutral-800">
                     System Stable v2.5.0
                  </Badge>
                  <h1 className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                     TicKas Operations <br />
                     <span className="text-neutral-400">Reimagined.</span>
                  </h1>
                  <p className="text-base text-neutral-500 dark:text-neutral-400 font-medium max-w-sm leading-relaxed">
                     Streamline your organizational infrastructure with our unified asset and support management platform.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4">
                  <Card className="p-6 bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                     <Activity size={20} className="text-neutral-900 dark:text-white mb-4" />
                     <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">99.9%</p>
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Uptime Reliability</p>
                  </Card>
                  <Card className="p-6 bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                     <ShieldCheck size={20} className="text-neutral-900 dark:text-white mb-4" />
                     <p className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">256-bit</p>
                     <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-2">Secure Encryption</p>
                  </Card>
               </div>
            </motion.div>

            {/* Login Form */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[420px] mx-auto">
               <Card className="p-8 lg:p-10 border-neutral-200 dark:border-neutral-800 shadow-xl">
                  <div className="mb-10">
                     <div className="w-12 h-12 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black mb-6">
                        <Fingerprint size={24} />
                     </div>
                     <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Sign In</h2>
                     <p className="text-neutral-500 mt-1 text-sm font-medium">Please enter your credentials to access the system.</p>
                  </div>

                  <AnimatePresence>
                     {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-950 text-red-600 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                           <ShieldCheck size={16} />
                           {error}
                        </motion.div>
                     )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Work Email</label>
                        <div className="relative group">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={16} />
                           <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="pl-11 h-11 text-sm" />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                           <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Secret Code</label>
                           <Link to="#" className="text-[10px] font-bold text-neutral-400 uppercase hover:text-black dark:hover:text-white transition-colors">Forgot?</Link>
                        </div>
                        <div className="relative group">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={16} />
                           <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-11 h-11 text-sm" />
                        </div>
                     </div>
                     <Button disabled={loading} type="submit" className="w-full h-11 rounded-lg text-xs font-bold uppercase tracking-widest mt-4">
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : <div className="flex items-center justify-center gap-2">Authorize Access <ArrowRight size={14} /></div>}
                     </Button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800 text-center">
                     <p className="text-[11px] font-medium text-neutral-500">
                        New to the platform? <Link to="/signup" className="text-black dark:text-white font-bold hover:underline underline-offset-2">Request Identity</Link>
                     </p>
                  </div>
               </Card>

               <p className="mt-8 text-[10px] text-center text-neutral-400 uppercase tracking-widest font-medium">
                  Authorized Personnel Only • Secure Session Enabled
               </p>
            </motion.div>

         </div>
      </div>
   );
}
