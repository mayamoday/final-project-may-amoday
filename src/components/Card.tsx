import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  /** "white" = standard white card, "glass" = glass-card style from globals */
  variant?: 'white' | 'glass';
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, variant = 'white', className = '', onClick }: CardProps) {
  const base =
    variant === 'glass'
      ? 'glass-card'
      : 'bg-white rounded-2xl shadow-soft border border-slate-100';

  return (
    <div className={`${base} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
