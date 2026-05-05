import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variantMap: Record<ButtonVariant, string> = {
  primary:
    'inline-flex items-center justify-center gap-2 bg-vibrant-pink text-white font-bold px-6 py-3 rounded-full shadow-[0_10px_15px_-3px_rgba(236,72,153,0.2)] hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer',
  secondary:
    'inline-flex items-center justify-center gap-2 bg-summer-sky text-white font-bold px-6 py-3 rounded-full shadow-[0_10px_15px_-3px_rgba(125,211,252,0.2)] hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer',
  ghost:
    'inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-500 font-bold px-6 py-3 rounded-xl hover:bg-white transition-all active:scale-[0.98] cursor-pointer',
};

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button className={`${variantMap[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
