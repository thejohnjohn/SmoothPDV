import React from 'react';
import type { Gerente } from '../../../../types/admin';
import { BotaoAtualizar } from '../../../BotaoAtualizar/BotaoAtualizar';
import { BotaoDeletar } from '../../../BotaoDeletar/BotaoDeletar';

interface GerentesListProps {
  gerentes: Gerente[];
  onSelecionarGerente: (gerente: Gerente) => void;
  onDeletarGerente: (id: number) => void;
  onAtualizarGerente: (id: number) => void;
}

export const GerentesList: React.FC<GerentesListProps> = ({
  gerentes,
  onSelecionarGerente,
  onDeletarGerente,
  onAtualizarGerente
}) => {
  if (gerentes.length === 0) {
    return (
      <div className="text-center py-8 text-black-medium">
        <p className="text-lg">Nenhum gerente cadastrado</p>
        <p className="text-sm">Clique em "Adicionar Gerente" para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {gerentes.map(gerente => (
        <div
          key={gerente.id}
          className="flex items-center justify-between p-4 bg-white-medium rounded-lg border border-black-light hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <span className="text-lg">👔</span>
            </div>
            
            <div>
              <h4 className="font-bold text-black">{gerente.nome}</h4>
              <p className="text-sm text-black-medium">{gerente.email}</p>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  gerente.status === 'ativo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {gerente.status}
                </span>
                {gerente.loja_nome && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {gerente.loja_nome}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <BotaoAtualizar 
              onClick={() => onAtualizarGerente(gerente.id)}
            />
            <BotaoDeletar 
              onClick={() => onDeletarGerente(gerente.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
