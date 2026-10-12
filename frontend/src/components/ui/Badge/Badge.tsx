import React from 'react';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'error' | 'warning' | 'info';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'border-line bg-surface-muted text-ink-muted',
  primary: 'border-primary-100 bg-primary-50 text-primary-700',
  success: 'border-success-100 bg-success-50 text-success-700',
  error: 'border-error-100 bg-error-50 text-error-700',
  warning: 'border-warning-100 bg-warning-50 text-warning-600',
  info: 'border-secondary-100 bg-secondary-50 text-secondary-700',
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'neutral', children, className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  );
};
