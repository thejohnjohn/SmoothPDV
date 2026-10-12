import React from 'react';
import { Package } from 'lucide-react';
import type { Product } from '../../../../types/products';
import { Badge } from '../../../ui/Badge/Badge';
import { Button } from '../../../ui/Button/Button';
import { Card } from '../../../ui/Card/Card';
import { EmptyState } from '../../../ui/EmptyState/EmptyState';
import { LoadingState } from '../../../ui/LoadingState/LoadingState';

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
    return <LoadingState />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-8 w-8" aria-hidden="true" />}
        title="Nenhum produto cadastrado na loja"
        description="Adicione produtos para começar as vendas"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <Card
          key={product.id}
          className="hover:shadow-md transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h4 className="font-bold text-ink text-lg mb-2 line-clamp-2">
                {product.descricao}
              </h4>
              
              {product.categoria && (
                <Badge tone="primary" className="mb-2">
                  {product.categoria}
                </Badge>
              )}
            </div>
            
            <Badge tone="info" className="ml-2">
              #{product.id}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Preço:</span>
              <span className="text-2xl font-bold text-success-700 tabular-nums">
                R$ {typeof product.preco === 'number' ? product.preco.toFixed(2) : product.preco}
              </span>
            </div>

            {product.vendedor_nome && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">Cadastrado por:</span>
                <span className="font-medium">{product.vendedor_nome}</span>
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-line">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelecionarProduto(product)}
                className="flex-1"
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDeletarProduto(product.id)}
                className="flex-1"
              >
                Excluir
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
