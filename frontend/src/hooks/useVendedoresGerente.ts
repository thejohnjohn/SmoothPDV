import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { Vendedor, VendedorCreateData } from '../types/admin';
import { sellerService } from '../services/sellerService';
import { useAuth } from './useAuth';

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error || fallback;
  }
  return fallback;
};

export const useVendedoresGerente = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const idLoja = user?.id_loja;

  const loadVendedores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await sellerService.getVendedoresByGerente();
      setVendedores(data);
      
    } catch (err: unknown) {
      console.error('Erro ao carregar vendedores:', err);
      setError(getErrorMessage(err, 'Erro ao carregar vendedores da loja'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.tipo === 'GERENTE') {
      loadVendedores();
    }
  }, [user, loadVendedores]);

  const createVendedor = useCallback(async (vendedorData: VendedorCreateData) => {
    try {
      // 🆕 CORREÇÃO: Sempre usar a loja do gerente logado
      const dataToSend: VendedorCreateData = {
        ...vendedorData,
        id_loja: idLoja // 🆕 FORÇAR usar a loja do gerente
      };

      console.log('💾 [GERENTE] Criando vendedor na loja:', dataToSend.id_loja);

      const novoVendedor = await sellerService.createVendedor(dataToSend);
      setVendedores(prev => [...prev, novoVendedor]);
      return novoVendedor;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao criar vendedor');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [idLoja]);

  const updateVendedor = useCallback(async (id: number, vendedorData: Partial<VendedorCreateData>) => {
    try {
      // 🆕 CORREÇÃO: Sempre usar a loja do gerente logado
      const dataToSend: Partial<VendedorCreateData> = {
        nome: vendedorData.nome,
        email: vendedorData.email,
        id_loja: idLoja, // 🆕 FORÇAR usar a loja do gerente
        status: vendedorData.status
      };

      console.log('💾 [GERENTE] Atualizando vendedor na loja:', dataToSend.id_loja);

      const vendedorAtualizado = await sellerService.updateVendedor(id, dataToSend);
      setVendedores(prev => prev.map(v => v.id === id ? vendedorAtualizado : v));
      return vendedorAtualizado;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao atualizar vendedor');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [idLoja]);

  const deleteVendedor = useCallback(async (id: number) => {
    try {
      await sellerService.deleteVendedor(id);
      setVendedores(prev => prev.filter(v => v.id !== id));
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao deletar vendedor');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const toggleVendedorStatus = useCallback(async (id: number, status: 'ativo' | 'inativo') => {
    try {
      const vendedorAtualizado = await sellerService.updateVendedorStatus(id, status);
      setVendedores(prev => prev.map(v => v.id === id ? vendedorAtualizado : v));
      return vendedorAtualizado;
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'Erro ao alterar status do vendedor');
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  return {
    vendedores,
    loading,
    error,
    loadVendedores,
    createVendedor,
    updateVendedor,
    deleteVendedor,
    toggleVendedorStatus
  };
};
