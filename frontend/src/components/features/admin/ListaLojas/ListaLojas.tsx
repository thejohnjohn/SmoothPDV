import React from 'react';
import { Building2 } from 'lucide-react';
import type { Loja } from '../../../../types/admin';
import { BotaoAtualizar } from '../../../BotaoAtualizar/BotaoAtualizar';
import { BotaoDeletar } from '../../../BotaoDeletar/BotaoDeletar';
import { Badge } from '../../../ui/Badge/Badge';
import { EmptyState } from '../../../ui/EmptyState/EmptyState';

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
      <EmptyState
        title="Nenhuma loja cadastrada"
        description='Clique em "Adicionar Loja" para começar'
      />
    );
  }

  return (
    <div className="space-y-4">
      {lojas.map(loja => (
        <div
          key={loja.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 hover:shadow-md transition-all duration-200"
          onClick={() => onSelecionarLoja(loja)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            
            <div>
              <h4 className="font-bold text-ink">{loja.nome}</h4>
              <p className="text-sm text-ink-muted">
                {loja.endereco} • {loja.telefone}
              </p>
              <div className="flex gap-2 mt-1">
                <Badge tone={loja.status === 'ativo' ? 'success' : 'error'}>
                  {loja.status}
                </Badge>
                {loja.cnpj && (
                  <Badge tone="info">
                    CNPJ: {loja.cnpj}
                  </Badge>
                )}
                {loja.email && (
                  <Badge tone="neutral">
                    {loja.email}
                  </Badge>
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
