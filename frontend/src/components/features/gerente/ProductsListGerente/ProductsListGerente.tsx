import React from 'react';
import type { Product } from '../../../../types/products';
import { BotaoAtualizar } from '../../../BotaoAtualizar/BotaoAtualizar';
import { BotaoDeletar } from '../../../BotaoDeletar/BotaoDeletar';

interface ProductsListGerenteProps {
  products: Product[];
  onSelecionarProduto: (product: Product) => void;
  onDeletarProduto: (id: number) => void;
  loading?: boolean;
}

export const ProductsListGerente: React.FC<ProductsListGerenteProps> = ({
  products,
  onSelecionarProduto,
  onDeletarProduto,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-black-medium">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-lg">Nenhum produto cadastrado na loja</p>
        <p className="text-sm">Adicione produtos para começar as vendas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-white rounded-xl border border-black-light p-6 hover:shadow-md transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h4 className="font-bold text-black text-lg mb-2 line-clamp-2">
                {product.descricao}
              </h4>
              
              {product.categoria && (
                <span className="inline-block bg-primary-light text-primary text-xs px-2 py-1 rounded-full mb-2">
                  {product.categoria}
                </span>
              )}
            </div>
            
            <span className="bg-secondary-light text-secondary text-sm px-2 py-1 rounded-full ml-2 font-bold">
              #{product.id}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-black-medium">Preço:</span>
              <span className="text-2xl font-bold text-success">
                R$ {typeof product.preco === 'number' ? product.preco.toFixed(2) : product.preco}
              </span>
            </div>

            {product.vendedor_nome && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-black-medium">Cadastrado por:</span>
                <span className="font-medium">{product.vendedor_nome}</span>
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => onSelecionarProduto(product)}
                className="flex-1 bg-primary hover:bg-primary-hover text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                Editar
              </button>
              <button 
                onClick={() => onDeletarProduto(product.id)}
                className="flex-1 bg-error hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};