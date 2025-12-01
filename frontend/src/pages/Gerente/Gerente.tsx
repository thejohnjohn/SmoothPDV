import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProdutosGerente } from '../../hooks/useProdutosGerente';
import { useVendedoresGerente } from '../../hooks/useVendedoresGerente';
import { ProductsListGerente } from '../../components/features/gerente/ProductsListGerente/ProductsListGerente';
import { VendedoresListGerente } from '../../components/features/gerente/VendedoresListGerente/VendedoresListGerente';

type ActiveTab = 'dashboard' | 'produtos' | 'vendedores' | 'vendas';

export const Gerente: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Carregar dados para estatísticas rápidas
  const { products, loadProducts: loadProdutos } = useProdutosGerente();
  const { vendedores, loadVendedores } = useVendedoresGerente();

  useEffect(() => {
    if (user?.tipo === 'GERENTE') {
      // Carregar dados iniciais para o dashboard
      loadProdutos();
      loadVendedores();
    }
  }, [user]);

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

  const tabs = [
    { id: 'dashboard' as ActiveTab, label: '📊 Dashboard', icon: '📊' },
    { id: 'produtos' as ActiveTab, label: '📦 Produtos', icon: '📦' },
    { id: 'vendedores' as ActiveTab, label: '👥 Vendedores', icon: '👥' },
    { id: 'vendas' as ActiveTab, label: '💰 Vendas', icon: '💰' },
  ];

  const stats = {
    totalProdutos: products.length,
    totalVendedores: vendedores.length,
    vendedoresAtivos: vendedores.filter(v => v.status === 'ativo').length,
    produtosCadastrados: products.length
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardGerente stats={stats} />;
      case 'produtos':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">📦 Gerenciar Produtos</h2>
              <button
                onClick={() => window.location.href = '/gerente/produtos'}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-all duration-200"
              >
                Gerenciar Produtos
              </button>
            </div>
            <ProductsListGerente
              products={products.slice(0, 6)} // Mostrar apenas 6 produtos no preview
              onSelecionarProduto={(product) => window.location.href = '/gerente/produtos'}
              onDeletarProduto={() => {}}
            />
            {products.length > 6 && (
              <div className="text-center">
                <button
                  onClick={() => window.location.href = '/gerente/produtos'}
                  className="text-primary hover:text-primary-hover font-medium"
                >
                  Ver todos os {products.length} produtos →
                </button>
              </div>
            )}
          </div>
        );
      case 'vendedores':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">👥 Gerenciar Vendedores</h2>
              <button
                onClick={() => window.location.href = '/gerente/vendedores'}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-all duration-200"
              >
                Gerenciar Vendedores
              </button>
            </div>
            <VendedoresListGerente
              vendedores={vendedores.slice(0, 6)} // Mostrar apenas 6 vendedores no preview
              onSelecionarVendedor={(vendedor) => window.location.href = '/gerente/vendedores'}
              onDeletarVendedor={() => {}}
              onAtualizarStatus={() => {}}
            />
            {vendedores.length > 6 && (
              <div className="text-center">
                <button
                  onClick={() => window.location.href = '/gerente/vendedores'}
                  className="text-primary hover:text-primary-hover font-medium"
                >
                  Ver todos os {vendedores.length} vendedores →
                </button>
              </div>
            )}
          </div>
        );
      case 'vendas':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-2xl font-bold text-black mb-4">Relatório de Vendas</h2>
            <p className="text-black-medium mb-6">
              Acesse o dashboard completo para ver relatórios detalhados de vendas
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-all duration-200"
            >
              📊 Ir para Dashboard
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">👔 Painel do Gerente</h1>
          <p className="text-black-medium mt-1">
            Gerencie sua loja, produtos, equipe e vendas
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-all duration-200"
          >
            📊 Dashboard Completo
          </button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-black-light p-6 text-center">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="font-bold text-black">Produtos</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalProdutos}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-black-light p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-bold text-black">Vendedores</h3>
          <p className="text-2xl font-bold text-success">{stats.totalVendedores}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-black-light p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="font-bold text-black">Ativos</h3>
          <p className="text-2xl font-bold text-green-600">{stats.vendedoresAtivos}</p>
        </div>
        
        <div className="bg-white rounded-xl border border-black-light p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="font-bold text-black">Vendas Hoje</h3>
          <p className="text-2xl font-bold text-purple-600">-</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-black-light p-1">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-black-medium hover:bg-primary-light hover:text-black'
              }`}
            >
              <span className="text-lg mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da Tab */}
      <div className="bg-white rounded-xl border border-black-light p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Componente de Dashboard para Gerente
const DashboardGerente: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-black">📊 Visão Geral da Loja</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo da Loja */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">🏪 Resumo da Loja</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Produtos Cadastrados:</span>
              <span className="font-bold text-blue-800">{stats.totalProdutos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Vendedores na Equipe:</span>
              <span className="font-bold text-blue-800">{stats.totalVendedores}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Vendedores Ativos:</span>
              <span className="font-bold text-green-600">{stats.vendedoresAtivos}</span>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-green-800 mb-4">⚡ Ações Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/gerente/produtos'}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors text-center"
            >
              📦 Gerenciar Produtos
            </button>
            <button
              onClick={() => window.location.href = '/gerente/vendedores'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors text-center"
            >
              👥 Gerenciar Vendedores
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-colors text-center"
            >
              📊 Ver Dashboard Completo
            </button>
          </div>
        </div>
      </div>

      {/* Dicas do Gerente */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-3">💡 Dicas para Gerentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
          <ul className="space-y-2">
            <li>• Monitore o desempenho da equipe no Dashboard</li>
            <li>• Mantenha o catálogo de produtos atualizado</li>
            <li>• Revise os relatórios de vendas semanalmente</li>
          </ul>
          <ul className="space-y-2">
            <li>• Capacite sua equipe de vendedores</li>
            <li>• Acompanhe os produtos mais vendidos</li>
            <li>• Use os relatórios para tomar decisões</li>
          </ul>
        </div>
      </div>
    </div>
  );
};