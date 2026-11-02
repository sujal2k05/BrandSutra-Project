import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, trend, trendLabel }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/50',
      pill: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      pill: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/50',
      pill: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
    },
    red: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/50',
      pill: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/50',
      pill: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 shadow-xs border border-slate-200/80 dark:border-slate-800/80 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${scheme.pill}`}>
                {trend}
              </span>
              {trendLabel && <span className="text-[11px] text-slate-400 dark:text-slate-500">{trendLabel}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.border} border transition-transform duration-200 group-hover:scale-105`}>
            <Icon className={`w-5 h-5 ${scheme.text}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
