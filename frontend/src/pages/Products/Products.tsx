import React, { useState, useEffect } from 'react';
import type { Product } from '../../types/products';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div>Carregando produtos...</div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Produtos</h1>
        {(user?.tipo === 'ADMIN' || user?.tipo === 'GERENTE' || user?.tipo === 'VENDEDOR') && (
          <button className="btn-primary">Novo Produto</button>
        )}
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.descricao}</h3>
            <p className="price">R$ {product.preco.toFixed(2)}</p>
            {product.vendedor_nome && (
              <p className="seller">Vendedor: {product.vendedor_nome}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};