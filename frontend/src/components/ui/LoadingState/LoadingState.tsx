import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ label = 'Carregando...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-3 py-10 text-ink-muted ${className}`} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-primary-500" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};
