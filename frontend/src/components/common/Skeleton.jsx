import React from 'react';

export const Skeleton = ({ className = '', count = 1 }) => {
  if (count === 1) {
    return (
      <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
    );
  }

  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`} />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-8 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;

