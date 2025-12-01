import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useProdutosGerente } from '../../../hooks/useProdutosGerente';
import { ProductsListGerente } from '../../../components/features/gerente/ProductsListGerente/ProductsListGerente';
import { ProductFormGerente } from '../../../components/features/gerente/ProductFormGerente/ProductFormGerente';
import type { Product } from '../../../types/products';

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

  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Verificar se o usuário é gerente
  if (user?.tipo !== 'GERENTE') {
    return (
      <div className="p-6">
        <div className="bg-error text-white p-4 rounded-lg text-center">
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

  const handleSalvarProduto = async (data: any) => {
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

  const handleDeletarProduto = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error('Erro ao deletar produto:', err);
        alert('Erro ao excluir produto. Tente novamente.');
      }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">📦 Gerenciar Produtos</h1>
          <p className="text-black-medium mt-1">
            Gerencie o catálogo de produtos da sua loja
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50"
          >
            🔄 Atualizar
          </button>
          
          {!showForm && (
            <button
              onClick={handleAdicionarProduto}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              + Adicionar Produto
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-error text-white p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold">Erro ao carregar produtos</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={loadProducts}
              className="ml-auto bg-white text-error px-3 py-1 rounded text-sm font-bold hover:bg-gray-100"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
            <div className="bg-white rounded-xl border border-black-light p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">
                  Catálogo de Produtos ({products.length})
                </h2>
                
                <div className="flex gap-4 text-sm">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    📦 {products.length} produtos
                  </span>
                </div>
              </div>

              <ProductsListGerente
                products={products}
                onSelecionarProduto={handleEditarProduto}
                onDeletarProduto={handleDeletarProduto}
                loading={loading}
              />
            </div>
          )}
        </div>

        {/* Estatísticas (visível apenas quando não há formulário) */}
        {!showForm && (
          <div className="lg:col-span-1 space-y-6">
            {/* Cartão de Estatísticas */}
            <div className="bg-white rounded-xl border border-black-light p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-black">📊 Estatísticas</h3>
                <button
                  onClick={handleCarregarEstatisticas}
                  className="text-primary hover:text-primary-hover text-sm font-medium"
                >
                  Atualizar
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-black-medium">Total Produtos</span>
                  <span className="font-bold text-blue-600 text-xl">{products.length}</span>
                </div>
                
                {stats?.estatisticas_gerais && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-black-medium">Produtos Vendidos</span>
                      <span className="font-bold text-green-600 text-xl">
                        {stats.estatisticas_gerais.produtos_vendidos || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-black-medium">Faturamento</span>
                      <span className="font-bold text-purple-600 text-sm">
                        R$ {parseFloat(stats.estatisticas_gerais.faturamento_produtos || 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-xl border border-black-light p-6">
              <h3 className="text-lg font-bold text-black mb-4">⚡ Ações Rápidas</h3>
              <div className="space-y-3">
                <button
                  onClick={handleAdicionarProduto}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center"
                >
                  + Novo Produto
                </button>
                <button
                  onClick={loadProducts}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center"
                >
                  🔄 Atualizar Lista
                </button>
              </div>
            </div>

            {/* Dicas */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-800 mb-3">💡 Dicas</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Mantenha os preços atualizados</li>
                <li>• Use categorias para organizar</li>
                <li>• Produtos com vendas não podem ser excluídos</li>
                <li>• Monitore os produtos mais vendidos</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};