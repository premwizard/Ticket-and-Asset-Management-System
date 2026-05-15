/**
 * src/pages/ProjectsPage.jsx
 * 
 * Professional SaaS Project Portfolio
 * Features: High-density initiative management, resource allocation tracking, and strategic overview.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { projectsApi } from '../services/api';
import { 
  Folder, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Briefcase, 
  ChevronRight, 
  Activity, 
  Clock, 
  Target,
  Layers,
  Search,
  Terminal,
  ArrowUpRight,
  PlusCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Card, Badge, Button, Input, cn } from '../components/ui';

export default function ProjectsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.getAll();
      setItems(Array.isArray(data) ? data : data.projects || []);
    } catch (err) {
      setError(err.message);
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user, loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await projectsApi.create(form);
      setForm({ name: '', description: '' });
      setIsAdding(false);
      success('Strategic initiative established');
      loadData();
    } catch (err) {
      toastError(err.message || 'Authorization failed for new project');
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return toastError('Administrative authorization required');
    if (!window.confirm('Terminate this project record? This action will archive all associated telemetry.')) return;
    try {
      await projectsApi.delete(id);
      success('Project record purged from infrastructure');
      loadData();
    } catch (err) {
      toastError(err.message || 'Purge operation failed');
    }
  };

  if (authLoading) return null;

  return (
    <div className="space-y-8 fade-in pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Project Portfolio</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage organizational initiatives and technical deployment nodes.</p>
        </div>

        <div className="flex items-center gap-3">
           {isAdmin && (
             <Button 
                variant={isAdding ? 'outline' : 'primary'}
                onClick={() => setIsAdding(!isAdding)} 
                className="h-10 px-4 flex items-center gap-2"
             >
               {isAdding ? <Activity size={14} className="animate-spin" /> : <PlusCircle size={16} />}
               <span className="text-xs font-bold uppercase tracking-widest">{isAdding ? 'Operational View' : 'Initialize Initiative'}</span>
             </Button>
           )}
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Completion Velocity', value: '84%', icon: Target },
           { label: 'Active Nodes', value: items.length, icon: Layers },
           { label: 'Cycle Time', value: '12d', icon: Clock },
           { label: 'System Integrity', value: '99.9%', icon: Activity },
         ].map(stat => (
           <Card key={stat.label} className="p-5 flex items-center gap-5">
              <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-100 dark:border-neutral-800">
                 <stat.icon size={18} />
              </div>
              <div>
                 <p className="text-lg font-bold text-neutral-900 dark:text-white leading-none">{stat.value}</p>
                 <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
              </div>
           </Card>
         ))}
      </div>

      {/* Creation Modal/Section */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-8 border-black dark:border-white">
              <form onSubmit={handleCreate} className="space-y-6">
                 <div className="flex items-center gap-2 mb-2">
                    <Terminal size={14} className="text-neutral-400" />
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">New Initiative Parameters</h4>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Project Identity</label>
                       <Input 
                          required
                          value={form.name} 
                          onChange={e => setForm({...form, name: e.target.value})} 
                          placeholder="E.g. Infrastructure Modernization Q3"
                          className="h-11 text-sm font-semibold"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Strategic Brief</label>
                       <Input 
                          value={form.description} 
                          onChange={e => setForm({...form, description: e.target.value})} 
                          placeholder="Operational objectives and scope..."
                          className="h-11 text-sm font-semibold"
                       />
                    </div>
                 </div>
                 <div className="flex gap-3 pt-2">
                    <Button type="submit" size="md">Establish Record</Button>
                    <Button type="button" variant="outline" size="md" onClick={() => setIsAdding(false)}>Abort</Button>
                 </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 && !loading ? (
          <div className="col-span-full py-40 text-center">
            <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-300">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Zero Active Initiatives</h3>
            <p className="text-sm text-neutral-500 mt-2 font-medium max-w-xs mx-auto leading-relaxed">Establish a new project record to begin tracking technical progress and resource allocation.</p>
          </div>
        ) : items.map(item => (
          <Card 
            key={item.id} 
            className="group p-8 flex flex-col h-full hover:border-black dark:hover:border-white transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-8">
               <div className="w-12 h-12 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                  <Folder size={20} />
               </div>
               <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">ID: {item.id}</span>
                  <Badge variant="success" className="text-[8px] px-2 h-5">Operational</Badge>
               </div>
            </div>
            
            <div className="flex-1">
               <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 leading-tight group-hover:translate-x-1 transition-transform">{item.name}</h3>
               <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-3 mb-8">{item.description || 'No strategic scope defined for this project instance.'}</p>
            </div>
            
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              {isAdmin && (
                <button onClick={() => handleDelete(item.id)} className="p-2 text-neutral-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
              <button className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors group/link">
                 Control Center <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
