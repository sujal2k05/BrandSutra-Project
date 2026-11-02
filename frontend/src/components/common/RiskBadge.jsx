import React from 'react';

const RiskBadge = ({ severity = 'LOW', size = 'sm' }) => {
  const sev = (severity || 'LOW').toUpperCase();

  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-[10px]' 
    : 'px-2.5 py-1 text-xs';

  switch (sev) {
    case 'CRITICAL':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 animate-pulse"></span>
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400"></span>
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></span>
          MEDIUM
        </span>
      );
    case 'PASSED':
    case 'LOW':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
          {sev === 'PASSED' ? 'PASSED' : 'LOW RISK'}
        </span>
      );
  }
};

export default RiskBadge;
