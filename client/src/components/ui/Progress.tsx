import React from 'react';

export function Progress({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
      <div className="h-full bg-brand-600" style={{ width: `${v}%` }} />
    </div>
  );
}
