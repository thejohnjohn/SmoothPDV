import { useState, useEffect } from 'react';
import { Sale } from '../types/sales';
import { saleService } from '../services/saleService';

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await saleService.getAll();
      setSales(data);
    } catch (err) {
      setError('Erro ao carregar vendas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: any) => {
    try {
      const newSale = await saleService.create(saleData);
      setSales(prev => [...prev, newSale]);
      return newSale;
    } catch (err) {
      setError('Erro ao criar venda');
      throw err;
    }
  };

  return {
    sales,
    loading,
    error,
    loadSales,
    createSale,
  };
};