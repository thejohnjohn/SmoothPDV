import React from 'react';
import { CheckCircle2, User, Users, XCircle } from 'lucide-react';
import type { Vendedor } from '../../../../types/admin';
import { BotaoAtualizar } from '../../../BotaoAtualizar/BotaoAtualizar';
import { BotaoDeletar } from '../../../BotaoDeletar/BotaoDeletar';
import { Badge } from '../../../ui/Badge/Badge';
import { Card } from '../../../ui/Card/Card';
import { EmptyState } from '../../../ui/EmptyState/EmptyState';
import { LoadingState } from '../../../ui/LoadingState/LoadingState';

interface VendedoresListGerenteProps {
  vendedores: Vendedor[];
  onSelecionarVendedor: (vendedor: Vendedor) => void;
  onDeletarVendedor: (id: number) => void;
  onAtualizarStatus: (id: number, status: 'ativo' | 'inativo') => void;
  loading?: boolean;
}

export const VendedoresListGerente: React.FC<VendedoresListGerenteProps> = ({
  vendedores,
  onSelecionarVendedor,
  onDeletarVendedor,
  onAtualizarStatus,
  loading = false
}) => {
  if (loading) {
    return <LoadingState />;
  }

  if (vendedores.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" aria-hidden="true" />}
        title="Nenhum vendedor na sua loja"
        description="Adicione vendedores para expandir sua equipe"
      />
    );
  }

  const handleStatusToggle = (vendedor: Vendedor) => {
    const newStatus = vendedor.status === 'ativo' ? 'inativo' : 'ativo';
    onAtualizarStatus(vendedor.id, newStatus);
  };

  return (
    <div className="space-y-4">
      {vendedores.map(vendedor => (
        <Card
          key={vendedor.id}
          padding="sm"
          className="flex items-center justify-between hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" aria-hidden="true" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-ink text-lg">{vendedor.nome}</h4>
                <button
                  onClick={() => handleStatusToggle(vendedor)}
                >
                  <Badge
                    tone={vendedor.status === 'ativo' ? 'success' : 'error'}
                    className={
                      vendedor.status === 'ativo'
                        ? 'hover:bg-success-100'
                        : 'hover:bg-error-100'
                    }
                  >
                    {vendedor.status === 'ativo' ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Inativo
                      </>
                    )}
                  </Badge>
                </button>
              </div>
              
              <p className="text-sm text-ink-muted">{vendedor.email}</p>
              
              <div className="flex gap-2 mt-2">
                <span className="text-xs text-ink-muted bg-surface-muted px-2 py-1 rounded">
                  ID: {vendedor.id}
                </span>
                {vendedor.criado_em && (
                  <span className="text-xs text-ink-muted bg-surface-muted px-2 py-1 rounded">
                    Cadastrado em: {new Date(vendedor.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <BotaoAtualizar 
              onClick={() => onSelecionarVendedor(vendedor)}
              size="sm"
            />
            <BotaoDeletar 
              onClick={() => onDeletarVendedor(vendedor.id)}
              size="sm"
            />
          </div>
        </Card>
      ))}
    </div>
  );
};
