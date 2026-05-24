import React from 'react';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'neutral' | 'success' | 'warning' | 'danger';
};

export function Badge({ className = '', variant = 'neutral', ...props }: Props) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border';
  const variants: Record<string, string> = {
    neutral: 'bg-slate-900 text-slate-200 border-slate-800',
    success: 'bg-emerald-950/40 text-emerald-200 border-emerald-900/60',
    warning: 'bg-amber-950/40 text-amber-200 border-amber-900/60',
    danger: 'bg-rose-950/40 text-rose-200 border-rose-900/60'
  };
  return <span className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
