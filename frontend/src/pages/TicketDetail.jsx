/**
 * src/pages/TicketDetail.jsx
 * 
 * Professional SaaS Ticket Detail
 * Features: High-density information architecture, secure metadata management, and clean interaction flow.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Ticket, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  AlertCircle, 
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Trash2,
  Edit3,
  Hash,
  Activity,
  History,
  Info
} from 'lucide-react';
import { ticketsApi, projectsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TicketAttachments from '../components/TicketAttachments';
import { Card, Badge, Button, cn } from '../components/ui';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [ticket, setTicket] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketData, projectsData] = await Promise.all([
        ticketsApi.getOne(id),
        projectsApi.getAll()
      ]);
      setTicket(ticketData);
      setProjects(Array.isArray(projectsData) ? projectsData : projectsData.projects || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Identity resolution failed for this record.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (newStatus) => {
    setSubmitting(true);
    try {
      await ticketsApi.update(id, { status: newStatus });
      setTicket(prev => ({ ...prev, status: newStatus }));
      success(`Resource status transitioned to ${newStatus}`);
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Authorize permanent record deletion? This action cannot be reverted.")) return;
    try {
      await ticketsApi.delete(id);
      success("Ticket record purged from infrastructure");
      navigate('/tickets');
    } catch (err) {
      toastError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 fade-in">
        <Loader2 className="w-10 h-10 text-neutral-300 animate-spin mb-6" />
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Synchronizing Metadata...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="py-20 max-w-lg mx-auto text-center px-6 fade-in">
        <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-neutral-400">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Resolution Error</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 font-medium leading-relaxed">
          {error || 'The requested resource identifier could not be located in the current environment.'}
        </p>
        <Button 
          variant="outline"
          onClick={() => navigate('/tickets')}
          className="mt-8"
        >
          Return to Registry
        </Button>
      </div>
    );
  }

  const project = projects.find(p => p.id === ticket.project_id);

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto pb-20">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/tickets')}
          className="group flex items-center gap-3 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Registry</span>
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 border-neutral-200 dark:border-neutral-800 text-neutral-500 flex items-center gap-2">
             <Hash size={12} /> {ticket.id}
          </Badge>
          {isAdmin && (
            <Button 
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="h-8 px-2 text-red-500 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                 <Badge variant={
                    ticket.priority === 'high' ? 'danger' : 
                    ticket.priority === 'medium' ? 'warning' : 'info'
                 }>
                    {ticket.priority} priority
                 </Badge>
                 <Badge variant={
                    ticket.status === 'open' ? 'success' :
                    ticket.status === 'in-progress' ? 'info' : 'default'
                 }>
                    {ticket.status.replace('-', ' ')}
                 </Badge>
                 <div className="ml-auto text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                 </div>
              </div>

              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight mb-8">
                 {ticket.title}
              </h1>

              <div className="prose dark:prose-invert max-w-none">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-4 bg-black dark:bg-white rounded-full" />
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Technical Brief</h4>
                 </div>
                 <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                    {ticket.description || "No technical parameters provided for this operation."}
                 </p>
              </div>
           </Card>

           {/* Attachments Section */}
           <Card className="p-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Deployment Artifacts</h4>
                 </div>
              </div>
              <TicketAttachments ticketId={parseInt(id)} />
           </Card>
        </div>

        {/* Sidebar Context */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* Context Metadata */}
           <Card className="p-6 space-y-6">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Resource Context</h4>
              <div className="space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-neutral-400">
                       <User size={14} />
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Originator</p>
                       <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 truncate">{ticket.created_by}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-neutral-400">
                       <Tag size={14} />
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Deployment Node</p>
                       <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 truncate">{project?.name || 'Unassigned Node'}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-neutral-400">
                       <Activity size={14} />
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Ingestion Timestamp</p>
                       <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 truncate">{new Date(ticket.created_at).toLocaleTimeString()}</p>
                    </div>
                 </div>
              </div>

              {isAdmin && (
                 <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Update Status</label>
                       <select 
                          value={ticket.status}
                          onChange={(e) => handleStatusUpdate(e.target.value)}
                          disabled={submitting}
                          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-black dark:focus:ring-white/20 appearance-none cursor-pointer"
                       >
                          <option value="open">Open Registry</option>
                          <option value="in-progress">In Operation</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Archived</option>
                       </select>
                    </div>
                    <Button variant="outline" className="w-full h-10 text-[10px] font-bold uppercase tracking-widest">
                       <Edit3 size={14} className="mr-2" /> Modify Record
                    </Button>
                 </div>
              )}
           </Card>

           {/* Security Warning */}
           <Card className="p-6 bg-neutral-950 dark:bg-neutral-900 border-none text-white">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                    <ShieldAlert size={16} />
                 </div>
                 <h4 className="text-xs font-bold uppercase tracking-widest">SLA Protocol</h4>
              </div>
              <p className="text-[11px] font-medium text-neutral-400 leading-relaxed">
                 Priority classification: {ticket.priority.toUpperCase()}. Operational responses are mandated within {ticket.priority === 'high' ? '4 hours' : '24 hours'} per service level agreement.
              </p>
              <button className="mt-6 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-white hover:text-neutral-300 transition-colors">
                 Policy Document <ArrowUpRight size={12} />
              </button>
           </Card>

           {/* Activity Snapshot */}
           <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <History size={14} className="text-neutral-400" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Last Modified: {new Date().toLocaleDateString()}</span>
           </div>

        </div>
      </div>
    </div>
  );
}
