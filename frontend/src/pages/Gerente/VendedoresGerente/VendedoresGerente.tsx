import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useVendedoresGerente } from '../../../hooks/useVendedoresGerente';
import { VendedoresListGerente } from '../../../components/features/gerente/VendedoresListGerente/VendedoresListGerente';
import { VendedorFormGerente } from '../../../components/features/gerente/VendedorFormGerente/VendedorFormGerente';
import type { Vendedor, VendedorCreateData } from '../../../types/admin';

export const VendedoresGerente: React.FC = () => {
  const { user } = useAuth();
  const {
    vendedores,
    loading,
    error,
    loadVendedores,
    createVendedor,
    updateVendedor,
    deleteVendedor,
    toggleVendedorStatus
  } = useVendedoresGerente();

  const [showForm, setShowForm] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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

  const handleAdicionarVendedor = () => {
    setSelectedVendedor(null);
    setShowForm(true);
  };

  const handleEditarVendedor = (vendedor: Vendedor) => {
    setSelectedVendedor(vendedor);
    setShowForm(true);
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setSelectedVendedor(null);
  };

  const handleSalvarVendedor = async (data: VendedorCreateData) => {
    setFormLoading(true);
    try {
      console.log('💾 [GERENTE] Salvando vendedor na loja:', user?.id_loja);

      if (selectedVendedor) {
        // 🆕 CORREÇÃO: Para atualização, dados já vêm com id_loja do formulário
        const updateData: Partial<VendedorCreateData> = {
          nome: data.nome,
          email: data.email,
          id_loja: data.id_loja, // 🆕 Já vem com a loja do gerente
          status: data.status
        };

        // Incluir senha apenas se foi preenchida
        if (data.senha && data.senha.length > 0) {
          updateData.senha = data.senha;
        }

        await updateVendedor(selectedVendedor.id, updateData);
      } else {
        // 🆕 CORREÇÃO: Para criação, dados já vêm com id_loja do formulário
        await createVendedor(data);
      }

      setShowForm(false);
      setSelectedVendedor(null);
    } catch (err) {
      console.error('Erro ao salvar vendedor:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletarVendedor = async (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este vendedor da sua loja?')) {
      try {
        await deleteVendedor(id);
      } catch (err) {
        console.error('Erro ao deletar vendedor:', err);
        alert('Erro ao remover vendedor. Tente novamente.');
      }
    }
  };

  const handleAtualizarStatus = async (id: number, status: 'ativo' | 'inativo') => {
    try {
      await toggleVendedorStatus(id, status);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao alterar status do vendedor.');
    }
  };

  const stats = {
    total: vendedores.length,
    ativos: vendedores.filter(v => v.status === 'ativo').length,
    inativos: vendedores.filter(v => v.status === 'inativo').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">👥 Gerenciar Vendedores</h1>
          <p className="text-black-medium mt-1">
            Gerencie a equipe de vendedores da sua loja
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadVendedores}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-all duration-200 disabled:opacity-50"
          >
            🔄 Atualizar
          </button>

          {!showForm && (
            <button
              onClick={handleAdicionarVendedor}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              + Adicionar Vendedor
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-error text-white p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold">Erro ao carregar vendedores</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
            <button
              onClick={loadVendedores}
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
            <VendedorFormGerente
              vendedor={selectedVendedor}
              onSubmit={handleSalvarVendedor}
              onCancel={handleCancelarForm}
              loading={formLoading}
            />
          ) : (
            <div className="bg-white rounded-xl border border-black-light p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">
                  Equipe de Vendedores ({stats.total})
                </h2>

                <div className="flex gap-4 text-sm">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    ✅ {stats.ativos} ativos
                  </span>
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
                    ❌ {stats.inativos} inativos
                  </span>
                </div>
              </div>

              <VendedoresListGerente
                vendedores={vendedores}
                onSelecionarVendedor={handleEditarVendedor}
                onDeletarVendedor={handleDeletarVendedor}
                onAtualizarStatus={handleAtualizarStatus}
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
              <h3 className="text-lg font-bold text-black mb-4">📊 Resumo da Equipe</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-black-medium">Total Vendedores</span>
                  <span className="font-bold text-blue-600 text-xl">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-black-medium">Vendedores Ativos</span>
                  <span className="font-bold text-green-600 text-xl">{stats.ativos}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-black-medium">Vendedores Inativos</span>
                  <span className="font-bold text-red-600 text-xl">{stats.inativos}</span>
                </div>
              </div>
            </div>

            {/* Dicas Rápidas */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-800 mb-3">💡 Dicas</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li>• Vendedores ativos podem acessar o PDV</li>
                <li>• Vendedores inativos não conseguem fazer login</li>
                <li>• Cada vendedor tem suas próprias vendas e relatórios</li>
                <li>• Monitore o desempenho da sua equipe no Dashboard</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};