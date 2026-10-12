import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, id, className = '', ...props }) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink transition-colors placeholder:text-ink-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted ${error ? 'border-error-500' : 'border-line'} ${className}`}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-semibold text-error-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
