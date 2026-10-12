import React from 'react';
import { Briefcase } from 'lucide-react';
import type { Gerente } from '../../../../types/admin';
import { BotaoAtualizar } from '../../../BotaoAtualizar/BotaoAtualizar';
import { BotaoDeletar } from '../../../BotaoDeletar/BotaoDeletar';
import { Badge } from '../../../ui/Badge/Badge';
import { EmptyState } from '../../../ui/EmptyState/EmptyState';

interface GerentesListProps {
  gerentes: Gerente[];
  onSelecionarGerente: (gerente: Gerente) => void;
  onDeletarGerente: (id: number) => void;
  onAtualizarGerente: (id: number) => void;
}

export const GerentesList: React.FC<GerentesListProps> = ({
  gerentes,
  onDeletarGerente,
  onAtualizarGerente
}) => {
  if (gerentes.length === 0) {
    return (
      <EmptyState
        title="Nenhum gerente cadastrado"
        description='Clique em "Adicionar Gerente" para começar'
      />
    );
  }

  return (
    <div className="space-y-4">
      {gerentes.map(gerente => (
        <div
          key={gerente.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <Briefcase className="h-5 w-5" aria-hidden="true" />
            </div>
            
            <div>
              <h4 className="font-bold text-ink">{gerente.nome}</h4>
              <p className="text-sm text-ink-muted">{gerente.email}</p>
              <div className="flex gap-2 mt-1">
                <Badge tone={gerente.status === 'ativo' ? 'success' : 'error'}>
                  {gerente.status}
                </Badge>
                {gerente.loja_nome && (
                  <Badge tone="info">
                    {gerente.loja_nome}
                  </Badge>
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
