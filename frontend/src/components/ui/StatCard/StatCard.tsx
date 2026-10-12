import React from 'react';
import { Card } from '../Card/Card';

export type StatTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

const toneClasses: Record<StatTone, string> = {
  primary: 'bg-primary-50 text-primary-700',
  secondary: 'bg-secondary-50 text-secondary-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-error-50 text-error-700',
};

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: StatTone;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, tone = 'primary' }) => {
  return (
    <Card padding="sm" className="flex items-center gap-3">
      {icon && (
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg ${toneClasses[tone]}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="truncate text-xl font-bold tabular-nums text-ink">{value}</p>
      </div>
    </Card>
  );
};
