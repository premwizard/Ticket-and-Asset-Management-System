/**
 * src/components/TicketAttachments.jsx
 *
 * High-fidelity file attachment component with drag-and-drop,
 * image previews, and premium animations.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  X,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { attachmentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const FILE_ICONS = {
  'application/pdf': <FileText size={20} />,
  'image/jpeg': <ImageIcon size={20} />,
  'image/png': <ImageIcon size={20} />,
  'image/webp': <ImageIcon size={20} />,
  'image/gif': <ImageIcon size={20} />,
  'text/plain': <File size={20} />,
  'text/csv': <File size={20} />,
  'application/zip': <File size={20} />,
  'default': <Paperclip size={20} />
};

export default function TicketAttachments({ ticketId }) {
  const { isAdmin } = useAuth();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef(null);

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const data = await attachmentsApi.getAll(ticketId);
      setAttachments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load attachments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) loadAttachments();
  }, [ticketId]);

  const handleFileUpload = async (files) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploading(true);
    try {
      for (const file of fileList) {
        if (file.size > 10 * 1024 * 1024) {
          toastError(`${file.name} exceeds 10MB limit.`);
          continue;
        }
        await attachmentsApi.upload(ticketId, file);
      }
      success('File(s) uploaded successfully');
      loadAttachments();
    } catch (err) {
      toastError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (att) => {
    try {
      const data = await attachmentsApi.download(ticketId, att.id);
      window.open(data.download_url, '_blank');
    } catch (err) {
      toastError('Download failed');
    }
  };

  const handleDelete = async (att) => {
    if (!window.confirm(`Permanently remove "${att.file_name}"?`)) return;
    try {
      await attachmentsApi.delete(ticketId, att.id);
      success('Attachment purged');
      loadAttachments();
    } catch (err) {
      toastError('Delete failed');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Paperclip size={22} className="text-indigo-600" />
          Evidence & Attachments
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-1">
            {attachments.length}
          </span>
        </h3>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-[32px] p-10 transition-all duration-300 flex flex-col items-center justify-center text-center",
          dragOver 
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 scale-[1.02]" 
            : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => { handleFileUpload(e.target.files); e.target.value = ''; }}
        />
        
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div 
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
              <p className="font-black text-xs uppercase tracking-widest text-indigo-600 animate-pulse">Transmitting Data...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <Upload size={28} />
              </div>
              <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-wider mb-2">
                Click to authorize upload or drag files
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                PDF, IMAGES, DOCS (MAX 10MB EACH)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Attachments List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {attachments.map((att, idx) => {
            const isImg = att.file_type?.startsWith('image/');
            return (
              <motion.div
                key={att.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                    {isImg ? (
                      <img 
                        src={att.storage_url} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      FILE_ICONS[att.file_type] || FILE_ICONS.default
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate pr-6 group-hover:text-indigo-600 transition-colors">
                      {att.file_name}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {formatSize(att.file_size)} &bull; {new Date(att.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions Hover */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDownload(att)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                  >
                    <Download size={16} />
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(att)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {attachments.length === 0 && !loading && (
        <div className="py-10 text-center border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-[32px]">
           <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">No attached evidence found for this request.</p>
        </div>
      )}
    </div>
  );
}
