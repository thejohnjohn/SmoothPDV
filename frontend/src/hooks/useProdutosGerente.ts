import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { Product, ProductFormData } from '../types/products';
import { productService } from '../services/productService';
import { useAuth } from './useAuth';

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error || fallback;
  }
  return fallback;
};

export const useProdutosGerente = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar o serviço específico para produtos da loja do gerente
      const data = await productService.getStoreProducts();
      setProducts(data);
      
    } catch (err: unknown) {
      console.error('Erro ao carregar produtos:', err);
      setError(getErrorMessage(err, 'Erro ao carregar produtos da loja'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.tipo === 'GERENTE') {
      loadProducts();
    }
  }, [user, loadProducts]);

  const createProduct = useCallback(async (productData: ProductFormData) => {
    try {
      const newProduct = await productService.create(productData);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao criar produto');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const updateProduct = useCallback(async (id: number, productData: Partial<Product>) => {
    try {
      const updatedProduct = await productService.update(id, productData);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao atualizar produto');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const deleteProduct = useCallback(async (id: number) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao deletar produto');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const getProductsStats = useCallback(async () => {
    try {
      return await productService.getStoreProductsStats();
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao carregar estatísticas');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

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
