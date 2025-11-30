import React from 'react';

interface BotaoAtualizarProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

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
        bg-success hover:bg-green-700 text-white rounded-lg flex items-center justify-center 
        transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]} ${className}
      `}
      title="Atualizar"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <span>🔄</span>
      )}
    </button>
  );
};