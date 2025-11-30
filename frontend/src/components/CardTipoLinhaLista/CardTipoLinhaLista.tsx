import React from 'react';

interface CardTipoLinhaListaProps {
  selected?: boolean;
  onSelect?: () => void;
  variavel1: string;
  variavel2: string;
  className?: string;
  disabled?: boolean;
}

export const CardTipoLinhaLista: React.FC<CardTipoLinhaListaProps> = ({
  selected = false,
  onSelect,
  variavel1,
  variavel2,
  className = '',
  disabled = false
}) => {
  return (
    <div 
      className={`
        flex items-center gap-4 p-4 border-2 rounded-lg transition-all
        ${selected 
          ? 'border-primary bg-primary-light/20' 
          : 'border-black-light hover:border-primary-medium'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={disabled ? undefined : onSelect}
    >
      {/* Radio Button */}
      <div className={`
        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
        ${selected 
          ? 'border-primary bg-primary' 
          : 'border-black-light'
        }
        ${disabled ? 'bg-gray-300 border-gray-400' : ''}
      `}>
        {selected && !disabled && (
          <div className="w-3 h-3 bg-white rounded-full"></div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-black">{variavel1}</h3>
        <p className="text-base text-black-medium">{variavel2}</p>
      </div>
    </div>
  );
};