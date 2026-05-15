/**
 * src/pages/AssetsPage.jsx
 * 
 * Professional SaaS Asset Management
 * Features: Clean asset grid, refined detail view, and minimal registration flow.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Monitor, 
  Laptop, 
  Smartphone, 
  Server, 
  Cpu,
  Trash2, 
  Edit3,
  Calendar,
  User,
  Hash,
  X,
  ChevronDown,
  Activity,
  Box,
  LayoutGrid,
  MoreVertical,
  ArrowRight,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { assetsApi } from '../services/api';
import { Card, Button, Badge, Input, cn } from '../components/ui';

export default function AssetsPage() {
  const { isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [form, setForm] = useState({
    name: '', type: '', status: 'active', assigned_to: '',
    serial_number: '', purchase_date: '', purchase_cost: '', description: ''
  });

  const [filters, setFilters] = useState({ search: '', status: '', type: '' });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await assetsApi.getAll();
      let allAssets = Array.isArray(data) ? data : data.assets || [];
      
      if (filters.search) {
        const s = filters.search.toLowerCase();
        allAssets = allAssets.filter(a => 
          a.name?.toLowerCase().includes(s) || 
          a.serial_number?.toLowerCase().includes(s)
        );
      }
      if (filters.status) allAssets = allAssets.filter(a => a.status === filters.status);
      if (filters.type) allAssets = allAssets.filter(a => a.type === filters.type);

      setAssets(allAssets);
    } catch (err) {
      toastError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [filters, toastError]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await assetsApi.update(editingId, form);
        success('Asset updated successfully');
      } else {
        await assetsApi.create({ ...form, purchase_cost: parseFloat(form.purchase_cost) || 0 });
        success('Asset registered successfully');
      }
      setIsModalOpen(false);
      fetchAssets();
    } catch (err) {
      toastError('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await assetsApi.delete(id);
      success('Asset deleted successfully');
      fetchAssets();
    } catch (err) {
      toastError('Deletion failed');
    }
  };

  const getAssetIcon = (type) => {
    const props = { size: 20, strokeWidth: 2 };
    switch (type?.toLowerCase()) {
      case 'laptop': return <Laptop {...props} />;
      case 'monitor': return <Monitor {...props} />;
      case 'phone': return <Smartphone {...props} />;
      case 'server': return <Server {...props} />;
      default: return <Cpu {...props} />;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Assets</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Manage and track organizational hardware and inventory.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="outline" size="md">
             <Download size={16} />
             <span>Export</span>
           </Button>
           {isAdmin && (
             <Button variant="primary" onClick={() => { setEditingId(null); setForm({name:'', type:'', status:'active', assigned_to:'', serial_number:'', purchase_date:'', purchase_cost:'', description:''}); setIsModalOpen(true); }} size="md">
               <Plus size={16} />
               <span>Add Asset</span>
             </Button>
           )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="md:col-span-2 relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
           <Input 
              name="search" value={filters.search} onChange={(e) => setFilters(p => ({...p, search: e.target.value}))} 
              placeholder="Search by name or serial..." className="pl-9 h-10 text-xs"
           />
        </div>
        <div className="relative">
           <select name="type" value={filters.type} onChange={(e) => setFilters(p => ({...p, type: e.target.value}))} className="input-saas pl-3 pr-8 h-10 appearance-none cursor-pointer text-xs font-semibold">
              <option value="">All Categories</option>
              <option value="Laptop">Laptop</option>
              <option value="Monitor">Monitor</option>
              <option value="Server">Server</option>
              <option value="Phone">Phone</option>
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
        </div>
        <div className="relative">
           <select name="status" value={filters.status} onChange={(e) => setFilters(p => ({...p, status: e.target.value}))} className="input-saas pl-3 pr-8 h-10 appearance-none cursor-pointer text-xs font-semibold">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-800 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
            <p className="text-xs font-medium text-neutral-500">Loading assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <Card className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-300 dark:text-neutral-700 mb-4">
              <Box size={32} />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">No assets found</h3>
            <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or register a new asset.</p>
            <Button variant="outline" className="mt-6" onClick={() => setFilters({ search: '', status: '', type: '' })}>Clear filters</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <Card 
                key={asset.id} 
                onClick={() => setSelectedAsset(asset)}
                className="group hover:border-neutral-900 dark:hover:border-neutral-100 cursor-pointer p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 group-hover:text-black dark:group-hover:text-white transition-colors border border-neutral-200 dark:border-neutral-700">
                      {getAssetIcon(asset.type)}
                    </div>
                    <Badge variant={asset.status === 'active' || asset.status === 'available' ? 'success' : 'warning'}>
                      {asset.status}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 group-hover:underline underline-offset-2">{asset.name}</h4>
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-4">SN: {asset.serial_number || 'N/A'}</p>
                </div>
                
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-500 border border-neutral-200 dark:border-neutral-700">
                      {asset.assigned_to?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 truncate max-w-[80px]">
                      {asset.assigned_to || 'Unassigned'}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingId(asset.id); setForm(asset); setIsModalOpen(true); }}
                        className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, asset.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setSelectedAsset(null)} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]" />
             <motion.div 
               initial={{ opacity:0, scale:0.95 }} 
               animate={{ opacity:1, scale:1 }} 
               exit={{ opacity:0, scale:0.95 }} 
               className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
             >
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">{getAssetIcon(selectedAsset.type)}</div>
                      <div>
                         <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">{selectedAsset.name}</h2>
                         <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Asset ID: #{selectedAsset.id}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedAsset(null)} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Description</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{selectedAsset.description || 'No detailed specifications logged.'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Acquired</p>
                              <p className="text-xs font-bold text-neutral-900 dark:text-white">{selectedAsset.purchase_date || 'N/A'}</p>
                           </div>
                           <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Valuation</p>
                              <p className="text-xs font-bold text-neutral-900 dark:text-white">${selectedAsset.purchase_cost || '0.00'}</p>
                           </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-neutral-900 text-white flex items-center gap-3 shadow-lg border border-neutral-800">
                          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700"><User size={18} /></div>
                          <div>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Assigned To</p>
                            <p className="text-xs font-bold">{selectedAsset.assigned_to || 'Available in Storage'}</p>
                          </div>
                        </div>
                        <Card className="p-4 space-y-3 bg-white dark:bg-neutral-900">
                           <h5 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Metadata</h5>
                           <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"><Hash size={14} className="text-neutral-400" /> {selectedAsset.serial_number || 'Not recorded'}</div>
                           <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"><Calendar size={14} className="text-neutral-400" /> Registered on {new Date(selectedAsset.created_at).toLocaleDateString()}</div>
                           <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300"><Activity size={14} className="text-neutral-400" /> Current status: {selectedAsset.status}</div>
                        </Card>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]" />
             <motion.div 
               initial={{ opacity:0, y:20 }} 
               animate={{ opacity:1, y:0 }} 
               exit={{ opacity:0, y:20 }} 
               className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
             >
                <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
                   <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">{editingId ? 'Edit Asset' : 'Register New Asset'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Asset Name</label>
                         <Input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="e.g. MacBook Pro M3" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Category</label>
                         <select required value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="input-saas h-10 text-xs">
                            <option value="">Select Category</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Server">Server</option>
                            <option value="Phone">Phone</option>
                         </select>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Status</label>
                         <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input-saas h-10 text-xs">
                            <option value="active">Active</option>
                            <option value="available">Available</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="retired">Retired</option>
                         </select>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Custodian</label>
                         <Input value={form.assigned_to} onChange={(e) => setForm({...form, assigned_to: e.target.value})} placeholder="User email or storage" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Serial Number</label>
                         <Input value={form.serial_number} onChange={(e) => setForm({...form, serial_number: e.target.value})} placeholder="SN-XXXXX" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Purchase Date</label>
                         <Input type="date" value={form.purchase_date} onChange={(e) => setForm({...form, purchase_date: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Description</label>
                      <textarea rows="3" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-xs focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 outline-none transition-all resize-none dark:text-white" />
                   </div>
                   <div className="pt-4 flex gap-3">
                      <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-10 text-xs">Cancel</Button>
                      <Button disabled={submitting} type="submit" className="flex-1 h-10 text-xs">{submitting ? 'Processing...' : (editingId ? 'Update Asset' : 'Register Asset')}</Button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
