import React, { useState, useEffect } from 'react';
import { Package, Plus, RefreshCw, Search } from 'lucide-react';
import type { Product } from '../../types/products';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { Input } from '../../components/ui/Input/Input';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.descricao.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Produtos"
        subtitle={`${filteredProducts.length} de ${products.length} produtos`}
        actions={
          (user?.tipo === 'ADMIN' || user?.tipo === 'GERENTE' || user?.tipo === 'VENDEDOR') && (
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo Produto
            </Button>
          )
        }
      />

      {/* Busca */}
      <Card padding="sm">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={loadProducts}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Atualizar
          </Button>
        </div>
      </Card>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-ink text-lg line-clamp-2 flex-1">
                {product.descricao}
              </h3>
              <Badge tone="info" className="ml-2">
                #{product.id}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-ink-muted">Preço:</span>
                <span className="text-2xl font-bold text-success-600">
                  R$ {product.preco}
                </span>
              </div>

              {product.vendedor_nome && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">Vendedor:</span>
                  <span className="font-medium">{product.vendedor_nome}</span>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm" className="flex-1">
                  Editar
                </Button>
                <Button variant="danger" size="sm" className="flex-1">
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <EmptyState
          icon={<Package className="h-8 w-8" aria-hidden="true" />}
          title="Nenhum produto encontrado"
          description={search ? 'Tente alterar os termos da busca' : 'Cadastre o primeiro produto'}
        />
      )}
    </div>
  );
};
