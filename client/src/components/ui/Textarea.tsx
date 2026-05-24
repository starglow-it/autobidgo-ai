import React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = '', ...props }: Props) {
  return (
    <textarea
      className={`w-full rounded-xl bg-slate-950/50 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-400/60 ${className}`}
      {...props}
    />
  );
}
