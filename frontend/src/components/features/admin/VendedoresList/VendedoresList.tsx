import React from 'react';
import { User } from 'lucide-react';
import type { Vendedor } from '../../../../types/admin';
import { BotaoAtualizar } from '../../../BotaoAtualizar/BotaoAtualizar';
import { BotaoDeletar } from '../../../BotaoDeletar/BotaoDeletar';
import { Badge } from '../../../ui/Badge/Badge';
import { EmptyState } from '../../../ui/EmptyState/EmptyState';

interface VendedoresListProps {
  vendedores: Vendedor[];
  onSelecionarVendedor: (vendedor: Vendedor) => void;
  onDeletarVendedor: (id: number) => void;
  onAtualizarVendedor: (id: number) => void;
}

export const VendedoresList: React.FC<VendedoresListProps> = ({
  vendedores,
  onSelecionarVendedor,
  onDeletarVendedor,
  onAtualizarVendedor
}) => {
  if (vendedores.length === 0) {
    return (
      <EmptyState
        title="Nenhum vendedor cadastrado"
        description='Clique em "Adicionar Vendedor" para começar'
      />
    );
  }

  return (
    <div className="space-y-4">
      {vendedores.map(vendedor => (
        <div
          key={vendedor.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 hover:shadow-md transition-all duration-200"
          onClick={() => onSelecionarVendedor(vendedor)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" aria-hidden="true" />
            </div>
            
            <div>
              <h4 className="font-bold text-ink">{vendedor.nome}</h4>
              <p className="text-sm text-ink-muted">{vendedor.email}</p>
              <div className="flex gap-2 mt-1">
                <Badge tone={vendedor.status === 'ativo' ? 'success' : 'error'}>
                  {vendedor.status}
                </Badge>
                {vendedor.loja_nome && (
                  <Badge tone="info">
                    {vendedor.loja_nome}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <BotaoAtualizar 
              onClick={(e) => {
                e.stopPropagation();
                onAtualizarVendedor(vendedor.id);
              }}
            />
            <BotaoDeletar 
              onClick={(e) => {
                e.stopPropagation();
                onDeletarVendedor(vendedor.id);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
