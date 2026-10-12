import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, BarChart3, CheckCircle2, Package, Store, Users, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProdutosGerente } from '../../hooks/useProdutosGerente';
import { useVendedoresGerente } from '../../hooks/useVendedoresGerente';
import { ProductsListGerente } from '../../components/features/gerente/ProductsListGerente/ProductsListGerente';
import { VendedoresListGerente } from '../../components/features/gerente/VendedoresListGerente/VendedoresListGerente';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';
import { StatCard } from '../../components/ui/StatCard/StatCard';

type ActiveTab = 'dashboard' | 'produtos' | 'vendedores' | 'vendas';

interface GerenteStats {
  totalProdutos: number;
  totalVendedores: number;
  vendedoresAtivos: number;
  produtosCadastrados: number;
}

export const Gerente: React.FC = () => {
  const navigate = useNavigate();
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
  }, [user, loadProdutos, loadVendedores]);

  // Verificar se o usuário é gerente
  if (user?.tipo !== 'GERENTE') {
    return (
      <div className="p-6">
        <div className="bg-error-600 text-white p-4 rounded-lg text-center">
          <p className="text-lg font-bold">Acesso Restrito</p>
          <p>Esta página é exclusiva para gerentes.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'produtos' as ActiveTab, label: 'Produtos', icon: Package },
    { id: 'vendedores' as ActiveTab, label: 'Vendedores', icon: Users },
    { id: 'vendas' as ActiveTab, label: 'Vendas', icon: Banknote },
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
              <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
                <Package className="h-6 w-6" aria-hidden="true" />
                Gerenciar Produtos
              </h2>
              <Button
                size="lg"
                onClick={() => navigate('/gerente/produtos')}
              >
                Gerenciar Produtos
              </Button>
            </div>
            <ProductsListGerente
              products={products.slice(0, 6)} // Mostrar apenas 6 produtos no preview
              onSelecionarProduto={() => navigate('/gerente/produtos')}
              onDeletarProduto={() => {}}
            />
            {products.length > 6 && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/gerente/produtos')}
                >
                  Ver todos os {products.length} produtos →
                </Button>
              </div>
            )}
          </div>
        );
      case 'vendedores':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
                <Users className="h-6 w-6" aria-hidden="true" />
                Gerenciar Vendedores
              </h2>
              <Button
                size="lg"
                onClick={() => navigate('/gerente/vendedores')}
              >
                Gerenciar Vendedores
              </Button>
            </div>
            <VendedoresListGerente
              vendedores={vendedores.slice(0, 6)} // Mostrar apenas 6 vendedores no preview
              onSelecionarVendedor={() => navigate('/gerente/vendedores')}
              onDeletarVendedor={() => {}}
              onAtualizarStatus={() => {}}
            />
            {vendedores.length > 6 && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/gerente/vendedores')}
                >
                  Ver todos os {vendedores.length} vendedores →
                </Button>
              </div>
            )}
          </div>
        );
      case 'vendas':
        return (
          <div className="text-center py-12">
            <Banknote className="mx-auto mb-4 h-16 w-16 text-primary-700" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-ink mb-4">Relatório de Vendas</h2>
            <p className="text-ink-muted mb-6">
              Acesse o dashboard completo para ver relatórios detalhados de vendas
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Ir para Dashboard
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Painel do Gerente"
        subtitle="Gerencie sua loja, produtos, equipe e vendas"
        actions={
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Dashboard Completo
          </Button>
        }
      />

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Produtos"
          value={stats.totalProdutos}
          tone="primary"
          icon={<Package className="h-5 w-5" aria-hidden="true" />}
        />
        
        <StatCard
          label="Vendedores"
          value={stats.totalVendedores}
          tone="success"
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
        />
        
        <StatCard
          label="Ativos"
          value={stats.vendedoresAtivos}
          tone="success"
          icon={<CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
        />
        
        <StatCard
          label="Vendas Hoje"
          value="-"
          tone="primary"
          icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
        />
      </div>

      {/* Tabs */}
      <Card padding="none" className="p-1">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-center font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-ink-muted hover:bg-primary-100 hover:text-ink'
              }`}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Conteúdo da Tab */}
      <Card>
        {renderTabContent()}
      </Card>
    </div>
  );
};

// Componente de Dashboard para Gerente
const DashboardGerente: React.FC<{ stats: GerenteStats }> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
        <BarChart3 className="h-6 w-6" aria-hidden="true" />
        Visão Geral da Loja
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo da Loja */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-secondary-700">
            <Store className="h-5 w-5" aria-hidden="true" />
            Resumo da Loja
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Produtos Cadastrados:</span>
              <span className="font-bold text-secondary-700">{stats.totalProdutos}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Vendedores na Equipe:</span>
              <span className="font-bold text-secondary-700">{stats.totalVendedores}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-muted">Vendedores Ativos:</span>
              <span className="font-bold text-success-600">{stats.vendedoresAtivos}</span>
            </div>
          </div>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
            <Zap className="h-5 w-5" aria-hidden="true" />
            Ações Rápidas
          </h3>
          <div className="space-y-3">
            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={() => navigate('/gerente/produtos')}
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              Gerenciar Produtos
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/gerente/vendedores')}
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Gerenciar Vendedores
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/dashboard')}
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Ver Dashboard Completo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
