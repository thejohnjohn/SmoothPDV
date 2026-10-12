import React, { useState } from 'react';
import { BarChart3, Package, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useProdutosGerente } from '../../../hooks/useProdutosGerente';
import { ProductsListGerente } from '../../../components/features/gerente/ProductsListGerente/ProductsListGerente';
import { ProductFormGerente } from '../../../components/features/gerente/ProductFormGerente/ProductFormGerente';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Card } from '../../../components/ui/Card/Card';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog/ConfirmDialog';
import { ErrorState } from '../../../components/ui/ErrorState/ErrorState';
import { PageHeader } from '../../../components/ui/PageHeader/PageHeader';
import { useToast } from '../../../components/ui/Toast/useToast';
import type { Product, ProductFormData } from '../../../types/products';

interface ProductsStats {
  estatisticas_gerais?: {
    produtos_vendidos?: string | number;
    faturamento_produtos?: string | number;
  };
}

export const ProdutosGerente: React.FC = () => {
  const { user } = useAuth();
  const {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsStats
  } = useProdutosGerente();

  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [stats, setStats] = useState<ProductsStats | null>(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<number | null>(null);

  // Verificar se o usuário é gerente
  if (user?.tipo !== 'GERENTE') {
    return (
      <div className="p-6">
        <div className="bg-error-600 text-white p-4 rounded-lg text-center">
          <p className="text-lg font-bold">Acesso Restrito</p>
          <p>Esta página é exclusiva para gerentes.</p>
        </div>
      </div>
    );
  }

  const handleAdicionarProduto = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEditarProduto = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setSelectedProduct(null);
  };

  const handleSalvarProduto = async (data: ProductFormData) => {
    setFormLoading(true);
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data);
      } else {
        await createProduct(data);
      }
      setShowForm(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletarProduto = (id: number) => {
    setProdutoParaExcluir(id);
  };

  const handleConfirmarExclusao = async () => {
    if (produtoParaExcluir === null) return;
    const id = produtoParaExcluir;
    setProdutoParaExcluir(null);
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      showToast('Erro ao excluir produto. Tente novamente.', 'error');
    }
  };

  const handleCarregarEstatisticas = async () => {
    try {
      const statsData = await getProductsStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Gerenciar Produtos"
        subtitle="Gerencie o catálogo de produtos da sua loja"
        actions={
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={loadProducts}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </Button>
            
            {!showForm && (
              <Button
                size="lg"
                onClick={handleAdicionarProduto}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Adicionar Produto
              </Button>
            )}
          </>
        }
      />

      {error && (
        <ErrorState
          title="Erro ao carregar produtos"
          message={error}
          onRetry={loadProducts}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Estatísticas (visível apenas quando não há formulário) */}
        {!showForm && (
          <div className="lg:col-span-1 space-y-6">
            {/* Cartão de Estatísticas */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                  Estatísticas
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCarregarEstatisticas}
                >
                  Atualizar
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                  <span className="text-ink-muted">Total Produtos</span>
                  <span className="font-bold text-secondary-700 text-xl">{products.length}</span>
                </div>
                
                {stats?.estatisticas_gerais && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                      <span className="text-ink-muted">Produtos Vendidos</span>
                      <span className="font-bold text-success-700 text-xl">
                        {stats.estatisticas_gerais.produtos_vendidos || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                      <span className="text-ink-muted">Faturamento</span>
                      <span className="font-bold text-primary-700 text-sm">
                        R$ {parseFloat(String(stats.estatisticas_gerais.faturamento_produtos || 0)).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
        {/* Conteúdo Principal */}
        <div className={`${showForm ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          {showForm ? (
            <ProductFormGerente
              product={selectedProduct}
              onSubmit={handleSalvarProduto}
              onCancel={handleCancelarForm}
              loading={formLoading}
            />
          ) : (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-ink">
                  Catálogo de Produtos ({products.length})
                </h2>
                
                <div className="flex gap-4 text-sm">
                  <Badge tone="success">
                    <Package className="h-3.5 w-3.5" aria-hidden="true" />
                    {products.length} produtos
                  </Badge>
                </div>
              </div>

              <ProductsListGerente
                products={products}
                onSelecionarProduto={handleEditarProduto}
                onDeletarProduto={handleDeletarProduto}
                loading={loading}
              />
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={produtoParaExcluir !== null}
        title="Excluir produto"
        message="Tem certeza que deseja excluir este produto?"
        confirmLabel="Excluir"
        onConfirm={handleConfirmarExclusao}
        onCancel={() => setProdutoParaExcluir(null)}
      />
    </div>
  );
};
