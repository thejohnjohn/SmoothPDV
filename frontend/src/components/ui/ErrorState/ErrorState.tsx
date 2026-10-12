import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../Button/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title = 'Não foi possível carregar', message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-error-100 bg-error-50 px-6 py-8 text-center">
      <AlertTriangle className="h-6 w-6 text-error-600" aria-hidden="true" />
      <p className="text-sm font-semibold text-error-700">{title}</p>
      {message && <p className="max-w-md text-xs text-error-700/80">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Tentar novamente
        </Button>
      )}
    </div>
  );
};
