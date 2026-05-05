import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional icon name (material symbol) shown before the title */
  icon?: string;
  /** Icon color class e.g. "text-summer-sky" */
  iconColor?: string;
  /** Slot rendered on the right side (e.g. date badge, action button) */
  actions?: ReactNode;
}

import Icon from './Icon';

export default function PageHeader({ title, subtitle, icon, iconColor = 'text-summer-sky', actions }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div className="text-right">
        {icon && (
          <div className={`flex items-center gap-2 ${iconColor} mb-2`}>
            <Icon name={icon} className="text-xl" />
            <span className="text-xs font-bold uppercase tracking-wider">{subtitle}</span>
          </div>
        )}
        <h1 className="text-h1-display text-deep-slate font-black">{title}</h1>
        {subtitle && !icon && (
          <p className="text-slate-500 text-base mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}
