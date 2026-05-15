/**
 * src/pages/ProfilePage.jsx
 * 
 * Professional SaaS Profile Page
 * Features: Clean identity overview, secure credential management, and activity metrics.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  ShieldCheck, 
  Key, 
  Clock, 
  Activity, 
  Ticket, 
  Box, 
  LogOut,
  ChevronRight,
  Settings,
  Bell,
  Fingerprint,
  CheckCircle2,
  Lock,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, cn } from '../components/ui';

export default function ProfilePage() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="space-y-8 fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Account Settings</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage your identity, security credentials, and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="md" onClick={handleLogout} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/30">
              <LogOut size={16} />
              <span>Sign Out</span>
           </Button>
           <Button variant="primary" size="md">
              <Settings size={16} />
              <span>Preferences</span>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="p-0 overflow-hidden">
              <div className="h-24 bg-neutral-900 dark:bg-neutral-800" />
              <div className="px-6 pb-6 -mt-12 text-center">
                 <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-neutral-900 border-4 border-white dark:border-neutral-900 shadow-xl flex items-center justify-center text-3xl font-bold text-neutral-900 dark:text-white overflow-hidden">
                       <div className="w-full h-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center">
                          {user?.email?.[0]?.toUpperCase()}
                       </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-neutral-900 shadow-md">
                       <CheckCircle2 size={14} />
                    </div>
                 </div>

                 <h2 className="text-lg font-bold text-neutral-900 dark:text-white truncate">{user?.email?.split('@')[0]}</h2>
                 <p className="text-xs font-medium text-neutral-400 mt-1">{user?.email}</p>

                 <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                       <div className="flex items-center gap-2">
                          <UserCheck size={14} className="text-neutral-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Access Level</span>
                       </div>
                       <Badge variant={isAdmin ? 'warning' : 'info'}>
                         {isAdmin ? 'Administrator' : 'Staff'}
                       </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                       <div className="flex items-center gap-2">
                          <Fingerprint size={14} className="text-neutral-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Identity Status</span>
                       </div>
                       <span className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider">Verified</span>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="p-6 bg-neutral-950 dark:bg-neutral-900 text-white border-none">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6">Active Privileges</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Manage Resources', active: true },
                   { label: 'Support Requests', active: true },
                   { label: 'System Overrides', active: isAdmin },
                   { label: 'Audit Access', active: isAdmin },
                 ].map(priv => (
                    <div key={priv.label} className="flex items-center gap-3">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         priv.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-neutral-800"
                       )} />
                       <span className={cn("text-xs font-medium", priv.active ? "text-neutral-200" : "text-neutral-600")}>
                         {priv.label}
                       </span>
                    </div>
                 ))}
              </div>
           </Card>
        </div>

        {/* Right Column: Management Hub */}
        <div className="lg:col-span-8 space-y-6">
           
           <Card className="p-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <div className="flex border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                 {['overview', 'security', 'notifications'].map(tab => (
                    <button 
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={cn(
                         "px-8 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative border-r border-neutral-100 dark:border-neutral-800",
                         activeTab === tab ? "text-black dark:text-white bg-white dark:bg-neutral-900" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                       )}
                    >
                       {tab}
                       {activeTab === tab && (
                         <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
                       )}
                    </button>
                 ))}
              </div>

              <div className="p-8">
                 <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                       <motion.div 
                         key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="space-y-8"
                       >
                          <div>
                             <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">Primary Information</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Login Identifier</label>
                                   <p className="text-sm font-semibold text-neutral-900 dark:text-white">{user?.email}</p>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Session Established</label>
                                   <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                     {user?.last_sign_in_at ? new Date(user?.last_sign_in_at).toLocaleString() : 'N/A'}
                                   </p>
                                </div>
                             </div>
                          </div>

                          <div>
                             <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6">Operational Activity</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="p-5 flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-800/30">
                                   <Ticket className="text-neutral-400" size={24} />
                                   <div>
                                      <p className="text-xl font-bold text-neutral-900 dark:text-white">Active</p>
                                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tickets Queue</p>
                                   </div>
                                </Card>
                                <Card className="p-5 flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-800/30">
                                   <Box className="text-neutral-400" size={24} />
                                   <div>
                                      <p className="text-xl font-bold text-neutral-900 dark:text-white">Secure</p>
                                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Asset Nodes</p>
                                   </div>
                                </Card>
                                <Card className="p-5 flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-800/30">
                                   <Activity className="text-neutral-400" size={24} />
                                   <div>
                                      <p className="text-xl font-bold text-neutral-900 dark:text-white">Stable</p>
                                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Account Status</p>
                                   </div>
                                </Card>
                             </div>
                          </div>
                       </motion.div>
                    )}

                    {activeTab === 'security' && (
                       <motion.div 
                         key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="space-y-6"
                       >
                          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Lock size={14} />
                             Credentials & Access
                          </h4>
                          <div className="space-y-4">
                             <div className="flex items-center justify-between p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                <div>
                                   <p className="text-sm font-bold text-neutral-900 dark:text-white">Access Password</p>
                                   <p className="text-xs text-neutral-500 mt-0.5">Last rotation: 14 days ago</p>
                                </div>
                                <Button variant="outline" size="sm" className="text-[10px] font-bold">Modify</Button>
                             </div>
                             <div className="flex items-center justify-between p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                <div>
                                   <p className="text-sm font-bold text-neutral-900 dark:text-white">Two-Factor Auth</p>
                                   <p className="text-xs text-neutral-500 mt-0.5">Additional security layer for your node</p>
                                </div>
                                <Button variant="outline" size="sm" className="text-[10px] font-bold">Configure</Button>
                             </div>
                          </div>
                       </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                       <motion.div 
                         key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="py-12 text-center"
                       >
                          <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300 dark:text-neutral-700">
                             <Bell size={32} />
                          </div>
                          <h4 className="text-lg font-bold text-neutral-900 dark:text-white">Notification Center</h4>
                          <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">Manage how and when you receive critical system and support updates.</p>
                          <Button variant="outline" className="mt-8" size="md">Configure Alerts</Button>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 flex items-center gap-4 border-neutral-200 dark:border-neutral-800">
                 <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <Mail size={18} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Authorized Domain</p>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">{user?.email}</p>
                 </div>
              </Card>
              <Card className="p-6 flex items-center gap-4 border-neutral-200 dark:border-neutral-800">
                 <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <Clock size={18} />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">System Build</p>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">v2.5.0 STABLE</p>
                 </div>
              </Card>
           </div>

        </div>
      </div>
    </div>
  );
}
