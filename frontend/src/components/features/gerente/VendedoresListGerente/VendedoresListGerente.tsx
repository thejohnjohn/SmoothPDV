import React from 'react';
import type { Vendedor } from '../../../../types/admin';
import { BotaoAtualizar } from '../../../BotaoAtualizar/BotaoAtualizar';
import { BotaoDeletar } from '../../../BotaoDeletar/BotaoDeletar';

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
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (vendedores.length === 0) {
    return (
      <div className="text-center py-8 text-black-medium">
        <div className="text-6xl mb-4">👥</div>
        <p className="text-lg">Nenhum vendedor na sua loja</p>
        <p className="text-sm">Adicione vendedores para expandir sua equipe</p>
      </div>
    );
  }

  const handleStatusToggle = (vendedor: Vendedor) => {
    const newStatus = vendedor.status === 'ativo' ? 'inativo' : 'ativo';
    onAtualizarStatus(vendedor.id, newStatus);
  };

  return (
    <div className="space-y-4">
      {vendedores.map(vendedor => (
        <div
          key={vendedor.id}
          className="flex items-center justify-between p-4 bg-white-medium rounded-lg border border-black-light hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-black text-lg">{vendedor.nome}</h4>
                <button
                  onClick={() => handleStatusToggle(vendedor)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    vendedor.status === 'ativo' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {vendedor.status === 'ativo' ? '✅ Ativo' : '❌ Inativo'}
                </button>
              </div>
              
              <p className="text-sm text-black-medium">{vendedor.email}</p>
              
              <div className="flex gap-2 mt-2">
                <span className="text-xs text-black-light bg-gray-100 px-2 py-1 rounded">
                  ID: {vendedor.id}
                </span>
                {vendedor.criado_em && (
                  <span className="text-xs text-black-light bg-gray-100 px-2 py-1 rounded">
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
        </div>
      ))}
    </div>
  );
};