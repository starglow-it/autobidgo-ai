import React from 'react';

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = '', children, ...props }: Props) {
  return (
    <select
      className={`w-full rounded-xl bg-slate-950/50 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-400/60 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
