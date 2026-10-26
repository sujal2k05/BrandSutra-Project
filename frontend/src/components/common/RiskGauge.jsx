import React from 'react';

const RiskGauge = ({ score = 0, level = 'LOW', size = 'md' }) => {
  // Clamp score
  const clamped = Math.max(0, Math.min(100, score));

  // Determine color scheme
  let strokeColor = '#10B981'; // Success Green (0-20)
  let textColor = 'text-status-success';
  let bgColor = 'bg-emerald-50';
  let borderColor = 'border-emerald-200';

  if (clamped > 70) {
    strokeColor = '#EF4444'; // Critical Red (71-100)
    textColor = 'text-status-critical';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
  } else if (clamped > 40) {
    strokeColor = '#F97316'; // High Orange (41-70)
    textColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
  } else if (clamped > 20) {
    strokeColor = '#F59E0B'; // Medium Amber (21-40)
    textColor = 'text-status-warning';
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-200';
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
            stroke="#E2E8F0"
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
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-extrabold ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl'} ${textColor}`}>
            {clamped}
          </span>
          <span className="text-[10px] uppercase font-semibold text-brandText-secondary tracking-wider">
            / 100
          </span>
        </div>
      </div>
      <div className={`mt-2 px-3 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${bgColor} ${textColor} ${borderColor}`}>
        {level} RISK
      </div>
    </div>
  );
};

export default RiskGauge;
