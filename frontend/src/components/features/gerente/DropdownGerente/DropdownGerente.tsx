import React, { useState } from 'react';

interface DropdownGerenteProps {
  opcoes: { id: string; nome: string }[];
  valorSelecionado: string;
  onMudarValor: (valor: string) => void;
  className?: string;
}

export const DropdownGerente: React.FC<DropdownGerenteProps> = ({
  opcoes,
  valorSelecionado,
  onMudarValor,
  className = ''
}) => {
  const [aberto, setAberto] = useState(false);

  const opcaoSelecionada = opcoes.find(opcao => opcao.id === valorSelecionado);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full bg-white border border-black-light rounded-lg px-4 py-3 text-left flex items-center justify-between hover:border-primary transition-colors"
      >
        <span className="text-black font-medium">
          {opcaoSelecionada?.nome || 'Selecione...'}
        </span>
        <span className={`transform transition-transform ${aberto ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {aberto && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setAberto(false)}
          />
          
          {/* Lista de opções */}
          <div className="absolute top-full left-0 right-0 bg-white border border-black-light rounded-lg shadow-lg z-20 mt-1 max-h-60 overflow-auto">
            {opcoes.map(opcao => (
              <button
                key={opcao.id}
                type="button"
                onClick={() => {
                  onMudarValor(opcao.id);
                  setAberto(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-primary-light transition-colors ${
                  valorSelecionado === opcao.id ? 'bg-primary text-white' : 'text-black'
                }`}
              >
                {opcao.nome}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};