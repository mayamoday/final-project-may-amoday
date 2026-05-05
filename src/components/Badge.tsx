import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'announcement';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  success:      'bg-emerald-100 text-emerald-600',
  warning:      'bg-amber-100 text-amber-600',
  danger:       'bg-red-50 text-red-600 border border-red-100',
  info:         'bg-sky-100 text-sky-600',
  neutral:      'bg-slate-100 text-slate-500',
  announcement: 'bg-sky-50 text-sky-600',
};

export default function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
