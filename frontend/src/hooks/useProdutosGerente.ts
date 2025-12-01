import { useState, useEffect } from 'react';
import type { Product } from '../types/products';
import { productService } from '../services/productService';
import { useAuth } from './useAuth';

export const useProdutosGerente = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.tipo === 'GERENTE') {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar o serviço específico para produtos da loja do gerente
      const data = await productService.getStoreProducts();
      setProducts(data);
      
    } catch (err: any) {
      console.error('Erro ao carregar produtos:', err);
      setError(err.response?.data?.error || 'Erro ao carregar produtos da loja');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: any) => {
    try {
      const newProduct = await productService.create(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar produto';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      const updatedProduct = await productService.update(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar produto';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar produto';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getProductsStats = async () => {
    try {
      return await productService.getStoreProductsStats();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao carregar estatísticas';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsStats
  };
};