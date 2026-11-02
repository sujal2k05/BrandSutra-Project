import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import Modal from './Modal';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}) => {
  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-100 dark:bg-rose-950/60',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-950/60',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    info: {
      icon: Info,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100 dark:bg-indigo-950/60',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
  }[type] || {
    icon: AlertCircle,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    btn: 'bg-rose-600 hover:bg-rose-700 text-white',
  };

  const IconComponent = iconConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl flex-shrink-0 ${iconConfig.bg}`}>
          <IconComponent className={`w-6 h-6 ${iconConfig.color}`} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 ${iconConfig.btn}`}
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          <span>{confirmText}</span>
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

