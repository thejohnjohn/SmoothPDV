import React from 'react';
import type { Vendedor } from '../../../../types/admin';
import { BotaoAtualizar } from '../../../BotaoAtualizar/BotaoAtualizar';
import { BotaoDeletar } from '../../../BotaoDeletar/BotaoDeletar';

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
      <div className="text-center py-8 text-black-medium">
        <p className="text-lg">Nenhum vendedor cadastrado</p>
        <p className="text-sm">Clique em "Adicionar Vendedor" para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vendedores.map(vendedor => (
        <div
          key={vendedor.id}
          className="flex items-center justify-between p-4 bg-white-medium rounded-lg border border-black-light hover:shadow-md transition-all duration-200"
          onClick={() => onSelecionarVendedor(vendedor)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            
            <div>
              <h4 className="font-bold text-black">{vendedor.nome}</h4>
              <p className="text-sm text-black-medium">{vendedor.email}</p>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vendedor.status === 'ativo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {vendedor.status}
                </span>
                {vendedor.loja_nome && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {vendedor.loja_nome}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <BotaoAtualizar 
              onClick={(e: any) => {
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
