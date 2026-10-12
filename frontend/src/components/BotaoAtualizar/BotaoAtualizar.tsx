import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface BotaoAtualizarProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const iconClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const BotaoAtualizar: React.FC<BotaoAtualizarProps> = ({
  onClick,
  disabled = false,
  className = '',
  size = 'md',
  loading = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        bg-success-600 hover:bg-success-700 text-white rounded-lg flex items-center justify-center 
        transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        ${sizeClasses[size]} ${className}
      `}
      title="Atualizar"
      aria-label="Atualizar"
    >
      {loading ? (
        <Loader2 className={`${iconClasses[size]} animate-spin`} aria-hidden="true" />
      ) : (
        <RefreshCw className={iconClasses[size]} aria-hidden="true" />
      )}
    </button>
  );
};
