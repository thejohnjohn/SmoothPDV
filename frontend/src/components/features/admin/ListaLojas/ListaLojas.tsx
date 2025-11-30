import React from 'react';
import type { Loja } from '../../../../types/admin';
import { BotaoAtualizar } from '../../../BotaoAtualizar/BotaoAtualizar';
import { BotaoDeletar } from '../../../BotaoDeletar/BotaoDeletar';

interface ListaLojasProps {
  lojas: Loja[];
  onSelecionarLoja: (loja: Loja) => void;
  onDeletarLoja: (id: number) => void;
  onAtualizarLoja: (id: number) => void;
}

export const ListaLojas: React.FC<ListaLojasProps> = ({
  lojas,
  onSelecionarLoja,
  onDeletarLoja,
  onAtualizarLoja
}) => {
  if (lojas.length === 0) {
    return (
      <div className="text-center py-8 text-black-medium">
        <p className="text-lg">Nenhuma loja cadastrada</p>
        <p className="text-sm">Clique em "Adicionar Loja" para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lojas.map(loja => (
        <div
          key={loja.id}
          className="flex items-center justify-between p-4 bg-white-medium rounded-lg border border-black-light hover:shadow-md transition-all duration-200"
          onClick={() => onSelecionarLoja(loja)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <span className="text-lg">🏢</span>
            </div>
            
            <div>
              <h4 className="font-bold text-black">{loja.nome}</h4>
              <p className="text-sm text-black-medium">
                {loja.endereco} • {loja.telefone}
              </p>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  loja.status === 'ativo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {loja.status}
                </span>
                {loja.cnpj && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    CNPJ: {loja.cnpj}
                  </span>
                )}
                {loja.email && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {loja.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <BotaoAtualizar 
              onClick={(e) => {
                e.stopPropagation();
                onAtualizarLoja(loja.id);
              }}
            />
            <BotaoDeletar 
              onClick={(e) => {
                e.stopPropagation();
                onDeletarLoja(loja.id);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};