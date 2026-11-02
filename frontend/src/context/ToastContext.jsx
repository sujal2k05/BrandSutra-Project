import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast container floating at bottom-right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              bg: 'bg-emerald-50 dark:bg-emerald-950/80',
              border: 'border-emerald-200 dark:border-emerald-800',
              text: 'text-emerald-900 dark:text-emerald-200',
              iconColor: 'text-emerald-600 dark:text-emerald-400',
            },
            error: {
              icon: AlertCircle,
              bg: 'bg-rose-50 dark:bg-rose-950/80',
              border: 'border-rose-200 dark:border-rose-800',
              text: 'text-rose-900 dark:text-rose-200',
              iconColor: 'text-rose-600 dark:text-rose-400',
            },
            warning: {
              icon: AlertTriangle,
              bg: 'bg-amber-50 dark:bg-amber-950/80',
              border: 'border-amber-200 dark:border-amber-800',
              text: 'text-amber-900 dark:text-amber-200',
              iconColor: 'text-amber-600 dark:text-amber-400',
            },
            info: {
              icon: Info,
              bg: 'bg-indigo-50 dark:bg-indigo-950/80',
              border: 'border-indigo-200 dark:border-indigo-800',
              text: 'text-indigo-900 dark:text-indigo-200',
              iconColor: 'text-indigo-600 dark:text-indigo-400',
            },
          }[toast.type] || {
            icon: Info,
            bg: 'bg-slate-50 dark:bg-slate-800',
            border: 'border-slate-200 dark:border-slate-700',
            text: 'text-slate-900 dark:text-slate-100',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
          };

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in ${typeConfig.bg} ${typeConfig.border}`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${typeConfig.iconColor}`} />
              <div className={`flex-1 text-xs font-medium leading-relaxed ${typeConfig.text}`}>
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

