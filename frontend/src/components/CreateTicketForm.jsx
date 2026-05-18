/**
 * src/components/CreateTicketForm.jsx
 *
 * High-fidelity ticket creation form with integrated two-stage file uploads.
 * Uses Framer Motion for smooth state transitions and premium UI tokens.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  X, 
  Upload, 
  ChevronDown, 
  FileText, 
  Image as ImageIcon, 
  File, 
  Paperclip,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ticketsApi, projectsApi, attachmentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-rar-compressed'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CreateTicketForm({ onSuccess, onCancel }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    project_id: '',
    priority: 'medium',
    status: 'open',
  });

  // File State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // UI State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'submitting' | 'done'
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, name: '' });
  const [errors, setErrors] = useState({});

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsApi.getAll();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    };
    loadProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Identity label required';
    return errs;
  };

  const addFiles = (files) => {
    const incoming = Array.from(files);
    const valid = [];
    const invalid = [];

    incoming.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        invalid.push(`"${file.name}" exceeds 10MB limit`);
      } else {
        const isDup = selectedFiles.some(f => f.name === file.name && f.size === file.size);
        if (!isDup) valid.push(file);
      }
    });

    if (invalid.length) toastError(invalid.join(', '));
    if (valid.length) setSelectedFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setStep('submitting');

    try {
      // Stage 1: Create Ticket
      console.log('[CREATE] Initializing operational request...');
      const ticket = await ticketsApi.create({
        ...form,
        project_id: form.project_id ? parseInt(form.project_id) : null
      });
      console.log(`[CREATE] ✅ Logic ID assigned: ${ticket.id}`);

      // Stage 2: Upload Files
      if (selectedFiles.length > 0) {
        console.log(`[UPLOAD] Transmitting ${selectedFiles.length} evidence packets...`);
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setUploadProgress({
            current: i + 1,
            total: selectedFiles.length,
            name: file.name
          });
          
          try {
            await attachmentsApi.upload(ticket.id, file);
            console.log(`[UPLOAD ✅] ${file.name} synced`);
          } catch (uploadErr) {
            console.error(`[UPLOAD ❌] ${file.name} failed:`, uploadErr.message);
          }
        }
      }

      setStep('done');
      success('Operational request registered successfully');
      
      if (onSuccess) onSuccess(ticket);
      
      setTimeout(() => {
        navigate(`/tickets/${ticket.id}`);
      }, 1500);

    } catch (err) {
      console.error('[CREATE] Registration failure:', err);
      toastError(err.message || 'Failed to register request');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return <ImageIcon size={18} />;
    if (type === 'application/pdf') return <FileText size={18} />;
    return <Paperclip size={18} />;
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (step === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mb-8"
        >
          {uploadProgress.total > 0 ? (
            <Upload className="text-indigo-600 animate-bounce" size={40} />
          ) : (
            <Loader2 className="text-indigo-600 animate-spin" size={40} />
          )}
        </motion.div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          {uploadProgress.total > 0 ? 'Transmitting Evidence...' : 'Registering Request...'}
        </h3>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">
          {uploadProgress.total > 0 
            ? `Packet ${uploadProgress.current} of ${uploadProgress.total}`
            : 'Establishing secure handshake with core services'}
        </p>
        
        {uploadProgress.total > 0 && (
          <div className="w-full max-w-xs space-y-4">
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest truncate px-4">
              {uploadProgress.name}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
        <motion.div 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="text-emerald-500" size={48} />
        </motion.div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Operation Complete</h3>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          Request logged and evidence secured
        </p>
        <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest animate-pulse">
          Redirecting to operational view...
        </p>
      </div>
    );
  }

  return (
    <div className="p-0">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Fields */}
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              Subject Identity <span className="text-red-500">*</span>
            </label>
            <input 
              required
              name="title"
              value={form.title}
              onChange={handleChange}
              className={cn(
                "input-premium h-14",
                errors.title && "border-red-500 ring-4 ring-red-500/10"
              )}
              placeholder="Brief objective summary..."
            />
            {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.title}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contextual Background</label>
            <textarea 
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="input-premium py-4 resize-none" 
              placeholder="Provide full operational context..."
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                Project Logic
              </label>
              <div className="relative">
                <select 
                  name="project_id"
                  value={form.project_id}
                  onChange={handleChange}
                  className="input-premium h-14 appearance-none pr-10"
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority Protocol</label>
              <div className="relative">
                <select 
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="input-premium h-14 appearance-none pr-10"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Attachment Section */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
            Evidence Packets
            <span className="text-[9px] font-bold opacity-60">PDF, IMAGES, DOCS (MAX 10MB)</span>
          </label>
          
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-[32px] p-8 text-center cursor-pointer transition-all duration-300",
              dragOver 
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 scale-[0.98]" 
                : "border-slate-100 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50/30 dark:hover:bg-slate-800/30"
            )}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              className="hidden" 
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-4 shadow-sm transition-transform duration-300",
                dragOver && "scale-110 text-indigo-600"
              )}>
                <Upload size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">
                {dragOver ? 'Release to Attach' : 'Click or Drag Evidence'}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Queue will upload post-registration</p>
            </div>
          </div>

          {/* File Previews */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {selectedFiles.map((file, idx) => (
                  <motion.div 
                    key={`${file.name}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden shadow-sm">
                       {file.type.startsWith('image/') ? (
                         <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                       ) : getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate pr-4">{file.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{formatSize(file.size)}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="pt-6 flex gap-4">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary h-14 flex-1 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em]"
          >
            Abort Request
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary h-14 flex-[1.5] rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20"
          >
            {loading ? 'Transmitting...' : (
              selectedFiles.length > 0 
                ? `Create Ticket + ${selectedFiles.length} Packets`
                : 'Register Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
