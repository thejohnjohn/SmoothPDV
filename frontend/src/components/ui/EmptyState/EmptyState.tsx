import React from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface-muted/50 px-6 py-10 text-center">
      <span className="text-ink-muted/70" aria-hidden="true">
        {icon ?? <Inbox className="h-8 w-8" />}
      </span>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-xs text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
