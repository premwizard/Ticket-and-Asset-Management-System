/**
 * src/pages/TicketsPage.jsx
 * 
 * Professional SaaS Tickets Page
 * Features: Clean filtering, modern table UI, and minimal modal design.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Ticket,
  ChevronRight,
  LayoutGrid,
  List,
  AlertCircle,
  ChevronDown,
  X,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ticketsApi } from '../services/api';
import { Card, Button, Badge, Input, cn } from '../components/ui';
import CreateTicketForm from '../components/CreateTicketForm';

export default function TicketsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ticketsApi.getAll();
      let allTickets = Array.isArray(data) ? data : data.tickets || [];
      
      if (filters.search) {
        const lowerSearch = filters.search.toLowerCase();
        allTickets = allTickets.filter(t => 
          (t.title && t.title.toLowerCase().includes(lowerSearch)) || 
          (t.description && t.description.toLowerCase().includes(lowerSearch))
        );
      }
      if (filters.status) allTickets = allTickets.filter(t => t.status === filters.status);
      if (filters.priority) allTickets = allTickets.filter(t => t.priority === filters.priority);

      setTickets(allTickets);
    } catch (err) {
      toastError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filters, toastError]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await ticketsApi.delete(id);
      success('Ticket deleted successfully');
      fetchTickets();
    } catch (err) {
      toastError('Deletion failed');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Tickets</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage and track support requests across the organization.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm" : "text-neutral-400")}><List size={16} /></button>
              <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm" : "text-neutral-400")}><LayoutGrid size={16} /></button>
           </div>
           <Button variant="outline" size="md">
             <Download size={16} />
             <span>Export</span>
           </Button>
           <Button variant="primary" onClick={() => setIsModalOpen(true)} size="md">
             <Plus size={16} />
             <span>New Ticket</span>
           </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="md:col-span-2 relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
           <Input 
              name="search" value={filters.search} onChange={handleFilterChange} 
              placeholder="Search by title or description..." className="pl-9 h-10 text-xs"
           />
        </div>
        <div className="relative">
           <select name="status" value={filters.status} onChange={handleFilterChange} className="input-saas pl-3 pr-8 h-10 appearance-none cursor-pointer text-xs font-semibold">
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
        </div>
        <div className="relative">
           <select name="priority" value={filters.priority} onChange={handleFilterChange} className="input-saas pl-3 pr-8 h-10 appearance-none cursor-pointer text-xs font-semibold">
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Table/Grid Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-800 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
            <p className="text-xs font-medium text-neutral-500">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-300 dark:text-neutral-700 mb-4">
              <Ticket size={32} />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">No tickets found</h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or create a new support request.</p>
            <Button variant="outline" className="mt-6" onClick={() => setFilters({ search: '', status: '', priority: '' })}>Clear filters</Button>
          </Card>
        ) : viewMode === 'list' ? (
          <div className="table-container">
            <table className="table-saas">
              <thead>
                <tr>
                  <th className="w-[45%]">Ticket Details</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr 
                    key={t.id} 
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="cursor-pointer"
                  >
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral-900 dark:text-white">{t.title}</span>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400 font-medium">
                          <span>#{t.id}</span>
                          <span className="w-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                          <span>{new Date(t.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={t.status === 'open' ? 'warning' : t.status === 'resolved' ? 'success' : 'info'}>
                        {t.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'info' : 'default'}>
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        {isAdmin && (
                          <button 
                            onClick={(e) => handleDelete(e, t.id)} 
                            className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((t) => (
              <Card 
                key={t.id} 
                onClick={() => navigate(`/tickets/${t.id}`)}
                className="hover:border-neutral-900 dark:hover:border-neutral-100 cursor-pointer p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={t.priority === 'high' ? 'danger' : 'default'}>{t.priority}</Badge>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">#{t.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2">{t.title}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 mb-6">{t.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <Badge variant={t.status === 'open' ? 'warning' : 'info'}>{t.status}</Badge>
                  <span className="text-[10px] text-neutral-400 font-bold">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]" />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0, scale: 0.95 }} 
               className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
             >
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
                   <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Create New Ticket</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors"><X size={18} /></button>
                </div>
                <div className="p-6">
                   <CreateTicketForm onSuccess={() => { setIsModalOpen(false); fetchTickets(); }} onCancel={() => setIsModalOpen(false)} />
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
