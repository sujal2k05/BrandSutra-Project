import React from 'react';

const RiskGauge = ({ score = 0, level = 'LOW', size = 'md' }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  let strokeColor = '#10B981'; // Green (0-20)
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  let bgColor = 'bg-emerald-50 dark:bg-emerald-950/50';
  let borderColor = 'border-emerald-200 dark:border-emerald-800';

  if (clamped > 70) {
    strokeColor = '#EF4444'; // Red (71-100)
    textColor = 'text-rose-600 dark:text-rose-400';
    bgColor = 'bg-rose-50 dark:bg-rose-950/50';
    borderColor = 'border-rose-200 dark:border-rose-800';
  } else if (clamped > 40) {
    strokeColor = '#F97316'; // Orange (41-70)
    textColor = 'text-orange-600 dark:text-orange-400';
    bgColor = 'bg-orange-50 dark:bg-orange-950/50';
    borderColor = 'border-orange-200 dark:border-orange-800';
  } else if (clamped > 20) {
    strokeColor = '#F59E0B'; // Amber (21-40)
    textColor = 'text-amber-600 dark:text-amber-400';
    bgColor = 'bg-amber-50 dark:bg-amber-950/50';
    borderColor = 'border-amber-200 dark:border-amber-800';
  }

  const radius = size === 'sm' ? 36 : size === 'lg' ? 70 : 54;
  const strokeWidth = size === 'sm' ? 6 : size === 'lg' ? 12 : 9;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const dimension = radius * 2 + 10;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <svg height={dimension} width={dimension} className="transform -rotate-90">
          <circle
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-black tracking-tight ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl'} ${textColor}`}>
            {clamped}
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            / 100
          </span>
        </div>
      </div>
      <div className={`mt-2 px-3 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${bgColor} ${textColor} ${borderColor}`}>
        {level} RISK
      </div>
    </div>
  );
};

export default RiskGauge;
