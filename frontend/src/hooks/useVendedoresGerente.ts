import { useState, useEffect } from 'react';
import type { Vendedor, VendedorCreateData } from '../types/admin';
import { sellerService } from '../services/sellerService';
import { useAuth } from './useAuth';

export const useVendedoresGerente = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.tipo === 'GERENTE') {
      loadVendedores();
    }
  }, [user]);

  const loadVendedores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await sellerService.getVendedoresByGerente();
      setVendedores(data);
      
    } catch (err: any) {
      console.error('Erro ao carregar vendedores:', err);
      setError(err.response?.data?.error || 'Erro ao carregar vendedores da loja');
    } finally {
      setLoading(false);
    }
  };

  const createVendedor = async (vendedorData: VendedorCreateData) => {
    try {
      // 🆕 CORREÇÃO: Sempre usar a loja do gerente logado
      const dataToSend: VendedorCreateData = {
        ...vendedorData,
        id_loja: user?.id_loja // 🆕 FORÇAR usar a loja do gerente
      };

      console.log('💾 [GERENTE] Criando vendedor na loja:', dataToSend.id_loja);

      const novoVendedor = await sellerService.createVendedor(dataToSend);
      setVendedores(prev => [...prev, novoVendedor]);
      return novoVendedor;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar vendedor';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateVendedor = async (id: number, vendedorData: Partial<VendedorCreateData>) => {
    try {
      // 🆕 CORREÇÃO: Sempre usar a loja do gerente logado
      const dataToSend: Partial<VendedorCreateData> = {
        nome: vendedorData.nome,
        email: vendedorData.email,
        id_loja: user?.id_loja, // 🆕 FORÇAR usar a loja do gerente
        status: vendedorData.status
      };

      console.log('💾 [GERENTE] Atualizando vendedor na loja:', dataToSend.id_loja);

      const vendedorAtualizado = await sellerService.updateVendedor(id, dataToSend);
      setVendedores(prev => prev.map(v => v.id === id ? vendedorAtualizado : v));
      return vendedorAtualizado;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar vendedor';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteVendedor = async (id: number) => {
    try {
      await sellerService.deleteVendedor(id);
      setVendedores(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar vendedor';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const toggleVendedorStatus = async (id: number, status: 'ativo' | 'inativo') => {
    try {
      const vendedorAtualizado = await sellerService.updateVendedorStatus(id, status);
      setVendedores(prev => prev.map(v => v.id === id ? vendedorAtualizado : v));
      return vendedorAtualizado;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao alterar status do vendedor';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

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