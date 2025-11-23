import React, { useState, useEffect } from 'react';
import type { Product } from '../../types/products';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Produtos</h1>
          <p className="text-gray-600 mt-1">
            {filteredProducts.length} de {products.length} produtos
          </p>
        </div>
        
        {(user?.tipo === 'ADMIN' || user?.tipo === 'GERENTE' || user?.tipo === 'VENDEDOR') && (
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
            + Novo Produto
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={loadProducts}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg border border-gray-300 transition-colors"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 flex-1">
                {product.descricao}
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                #{product.id}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Preço:</span>
                <span className="text-2xl font-bold text-success">
                  R$ {product.preco}
                </span>
              </div>

              {product.vendedor_nome && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Vendedor:</span>
                  <span className="font-medium">{product.vendedor_nome}</span>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Editar
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          <p className="text-gray-400 mt-1">
            {search ? 'Tente alterar os termos da busca' : 'Cadastre o primeiro produto'}
          </p>
        </div>
      )}
    </div>
  );
};