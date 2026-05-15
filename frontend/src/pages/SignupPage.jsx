/**
 * src/pages/SignupPage.jsx
 * 
 * Professional SaaS Onboarding Interface
 * Features: Minimalist registration flow, secure role selection, and clean TicKas aesthetic.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserPlus, Shield, Command, Sparkles, Hexagon, Fingerprint, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Badge, cn } from '../components/ui';

export default function SignupPage() {
   const { signUp, user } = useAuth();
   const navigate = useNavigate();

   useEffect(() => {
      if (user) navigate('/dashboard', { replace: true });
   }, [user, navigate]);

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirm, setConfirm] = useState('');
   const [role, setRole] = useState('user');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);

      if (password !== confirm) {
         setError('Passwords do not match.');
         return;
      }
      if (password.length < 8) {
         setError('Password must be at least 8 characters.');
         return;
      }

      setLoading(true);
      try {
         await signUp(email.trim(), password, role);
         navigate('/dashboard', { replace: true });
      } catch (err) {
         setError(err.message || 'Registration failed. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-neutral-950">

         <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Marketing Side */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block space-y-10">
               <div className="space-y-4">
                  <Badge variant="outline" className="text-neutral-500 border-neutral-200 dark:border-neutral-800">
                     Join the Network
                  </Badge>
                  <h1 className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                     Secure Access <br />
                     <span className="text-neutral-400">Simplified.</span>
                  </h1>
                  <p className="text-base text-neutral-500 dark:text-neutral-400 font-medium max-w-sm leading-relaxed">
                     Create your organizational profile and start managing your infrastructure with precision and security.
                  </p>
               </div>

               <div className="space-y-6">
                  {[
                     { title: 'Global Compliance', desc: 'SLA-backed uptime and security.', icon: ShieldCheck },
                     { title: 'Cloud Infrastructure', desc: 'Highly available and scalable.', icon: Hexagon },
                  ].map((feature, i) => (
                     <div key={i} className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
                           <feature.icon size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">{feature.title}</p>
                           <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-1">{feature.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>

            {/* Signup Form */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[460px] mx-auto">
               <Card className="p-8 lg:p-10 border-neutral-200 dark:border-neutral-800 shadow-xl">
                  <div className="mb-10 flex justify-between items-start">
                     <div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Create Account</h2>
                        <p className="text-neutral-500 mt-1 text-sm font-medium">Establish your corporate identity.</p>
                     </div>
                     <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 border border-neutral-200 dark:border-neutral-800">
                        <UserPlus size={20} />
                     </div>
                  </div>

                  <AnimatePresence>
                     {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-950 text-red-600 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                           <Shield size={16} />
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

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Password</label>
                           <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Confirm</label>
                           <Input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="h-11 text-sm" />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Access Authorization</label>
                        <div className="grid grid-cols-2 gap-3">
                           <button
                              type="button" onClick={() => setRole('user')}
                              className={cn(
                                 "h-12 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                                 role === 'user' ? "border-black dark:border-white bg-neutral-50 dark:bg-neutral-800" : "border-neutral-100 dark:border-neutral-900"
                              )}
                           >
                              <UserCheck size={14} className={role === 'user' ? "text-black dark:text-white" : "text-neutral-400"} />
                              <span className={cn("text-[10px] font-bold uppercase tracking-wider", role === 'user' ? "text-black dark:text-white" : "text-neutral-400")}>Staff Member</span>
                           </button>
                           <button
                              type="button" onClick={() => setRole('admin')}
                              className={cn(
                                 "h-12 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                                 role === 'admin' ? "border-black dark:border-white bg-neutral-50 dark:bg-neutral-800" : "border-neutral-100 dark:border-neutral-900"
                              )}
                           >
                              <Shield size={14} className={role === 'admin' ? "text-black dark:text-white" : "text-neutral-400"} />
                              <span className={cn("text-[10px] font-bold uppercase tracking-wider", role === 'admin' ? "text-black dark:text-white" : "text-neutral-400")}>Administrator</span>
                           </button>
                        </div>
                     </div>

                     <Button disabled={loading} type="submit" className="w-full h-11 rounded-lg text-xs font-bold uppercase tracking-widest mt-4">
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : <div className="flex items-center justify-center gap-2">Establish Identity <ArrowRight size={14} /></div>}
                     </Button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800 text-center">
                     <p className="text-[11px] font-medium text-neutral-500">
                        Already onboard? <Link to="/login" className="text-black dark:text-white font-bold hover:underline underline-offset-2">Access Portal</Link>
                     </p>
                  </div>
               </Card>

               <p className="mt-8 text-[10px] text-center text-neutral-400 uppercase tracking-widest font-medium">
                  ISO/IEC 27001 Compliant Registration Process
               </p>
            </motion.div>

         </div>
      </div>
   );
}
