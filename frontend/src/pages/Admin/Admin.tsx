import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ListaLojas } from '../../components/features/admin/ListaLojas/ListaLojas';
import { GerentesList } from '../../components/features/admin/GerentesList/GerentesList';
import { VendedoresList } from '../../components/features/admin/VendedoresList/VendedoresList';
import { LojaForm } from '../../components/features/admin/LojaForm/LojaForm';
import { GerenteForm } from '../../components/features/admin/GerenteForm/GerenteForm';
import { VendedorForm } from '../../components/features/admin/VendedorForm/VendedorForm';
import type { Loja, Gerente, Vendedor } from '../../types/admin';
import { adminService } from '../../services/adminService';

type ActiveTab = 'lojas' | 'gerentes' | 'vendedores';
type ActiveForm = 'loja' | 'gerente' | 'vendedor' | null;

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('lojas');
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [selectedItem, setSelectedItem] = useState<Loja | Gerente | Vendedor | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Estados para os dados - agora carregados da API
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setDataLoading(true);
    try {
      const [lojasData, gerentesData, vendedoresData] = await Promise.all([
        adminService.getLojas(),
        adminService.getGerentes(),
        adminService.getVendedores()
      ]);
      
      setLojas(lojasData);
      setGerentes(gerentesData);
      setVendedores(vendedoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Em caso de erro, manter arrays vazios
      setLojas([]);
      setGerentes([]);
      setVendedores([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleAdicionar = (tipo: ActiveForm) => {
    setSelectedItem(null);
    setActiveForm(tipo);
  };

  const handleEditar = (item: Loja | Gerente | Vendedor, tipo: ActiveForm) => {
    setSelectedItem(item);
    setActiveForm(tipo);
  };

  const handleCancelar = () => {
    setActiveForm(null);
    setSelectedItem(null);
  };

  // Handlers para Lojas - AGORA COM CAMPOS COMPLETOS
  const handleSalvarLoja = async (data: Omit<Loja, 'id' | 'criado_em'>) => {
    setLoading(true);
    try {
      if (selectedItem) {
        // Atualizar
        const lojaAtualizada = await adminService.updateLoja(selectedItem.id, data);
        setLojas(prev => prev.map(l => l.id === selectedItem.id ? lojaAtualizada : l));
      } else {
        // Criar - enviar todos os campos necessários
        const novaLoja = await adminService.createLoja(data);
        setLojas(prev => [...prev, novaLoja]);
      }
      setActiveForm(null);
      setSelectedItem(null);
    } catch (error) {
      console.error('Erro ao salvar loja:', error);
      alert('Erro ao salvar loja. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarLoja = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta loja?')) {
      try {
        await adminService.deleteLoja(id);
        setLojas(prev => prev.filter(l => l.id !== id));
      } catch (error) {
        console.error('Erro ao deletar loja:', error);
        alert('Erro ao deletar loja. Tente novamente.');
      }
    }
  };

  // Handlers para Gerentes
  const handleSalvarGerente = async (data: Omit<Gerente, 'id' | 'criado_em'>) => {
    setLoading(true);
    try {
      if (selectedItem) {
        const gerenteAtualizado = await adminService.updateGerente(selectedItem.id, data);
        setGerentes(prev => prev.map(g => g.id === selectedItem.id ? gerenteAtualizado : g));
      } else {
        const novoGerente = await adminService.createGerente(data);
        setGerentes(prev => [...prev, novoGerente]);
      }
      setActiveForm(null);
      setSelectedItem(null);
    } catch (error) {
      console.error('Erro ao salvar gerente:', error);
      alert('Erro ao salvar gerente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarGerente = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este gerente?')) {
      try {
        await adminService.deleteGerente(id);
        setGerentes(prev => prev.filter(g => g.id !== id));
      } catch (error) {
        console.error('Erro ao deletar gerente:', error);
        alert('Erro ao deletar gerente. Tente novamente.');
      }
    }
  };

  // Handlers para Vendedores
  const handleSalvarVendedor = async (data: Omit<Vendedor, 'id' | 'criado_em'>) => {
    setLoading(true);
    try {
      if (selectedItem) {
        const vendedorAtualizado = await adminService.updateVendedor(selectedItem.id, data);
        setVendedores(prev => prev.map(v => v.id === selectedItem.id ? vendedorAtualizado : v));
      } else {
        const novoVendedor = await adminService.createVendedor(data);
        setVendedores(prev => [...prev, novoVendedor]);
      }
      setActiveForm(null);
      setSelectedItem(null);
    } catch (error) {
      console.error('Erro ao salvar vendedor:', error);
      alert('Erro ao salvar vendedor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarVendedor = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este vendedor?')) {
      try {
        await adminService.deleteVendedor(id);
        setVendedores(prev => prev.filter(v => v.id !== id));
      } catch (error) {
        console.error('Erro ao deletar vendedor:', error);
        alert('Erro ao deletar vendedor. Tente novamente.');
      }
    }
  };

  const tabs = [
    { id: 'lojas' as ActiveTab, label: 'Lojas', icon: '🏢' },
    { id: 'gerentes' as ActiveTab, label: 'Gerentes', icon: '👔' },
    { id: 'vendedores' as ActiveTab, label: 'Vendedores', icon: '👤' },
  ];

  // Estado de loading geral
  if (dataLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">🏢 Painel Administrativo</h1>
          <p className="text-black-medium mt-1">
            Gerencie lojas, gerentes e vendedores do sistema
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={carregarDados}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-all duration-200"
            disabled={dataLoading}
          >
            🔄 Atualizar
          </button>
          
          {!activeForm && (
            <button
              onClick={() => handleAdicionar(activeTab === 'lojas' ? 'loja' : activeTab === 'gerentes' ? 'gerente' : 'vendedor')}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              + Adicionar {activeTab === 'lojas' ? 'Loja' : activeTab === 'gerentes' ? 'Gerente' : 'Vendedor'}
            </button>
          )}
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

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista/Formulário */}
        <div className={`${activeForm ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {activeForm === 'loja' ? (
            <LojaForm
              loja={selectedItem as Loja}
              onSubmit={handleSalvarLoja}
              onCancel={handleCancelar}
              loading={loading}
            />
          ) : activeForm === 'gerente' ? (
            <GerenteForm
              gerente={selectedItem as Gerente}
              lojas={lojas}
              onSubmit={handleSalvarGerente}
              onCancel={handleCancelar}
              loading={loading}
            />
          ) : activeForm === 'vendedor' ? (
            <VendedorForm
              vendedor={selectedItem as Vendedor}
              lojas={lojas}
              onSubmit={handleSalvarVendedor}
              onCancel={handleCancelar}
              loading={loading}
            />
          ) : (
            <div className="bg-white rounded-xl border border-black-light p-6">
              {activeTab === 'lojas' && (
                <>
                  <h2 className="text-xl font-bold text-black mb-4">📋 Lojas Cadastradas</h2>
                  <ListaLojas
                    lojas={lojas} // Propriedade lojas dando erro
                    onSelecionarLoja={(loja) => handleEditar(loja, 'loja')}
                    onDeletarLoja={handleDeletarLoja}
                    onAtualizarLoja={(id) => {
                      const loja = lojas.find(l => l.id === id);
                      if (loja) handleEditar(loja, 'loja');
                    }}
                  />
                </>
              )}

              {activeTab === 'gerentes' && (
                <>
                  <h2 className="text-xl font-bold text-black mb-4">👔 Gerentes Cadastrados</h2>
                  <GerentesList
                    gerentes={gerentes}
                    onSelecionarGerente={(gerente) => handleEditar(gerente, 'gerente')}
                    onDeletarGerente={handleDeletarGerente}
                    onAtualizarGerente={(id) => {
                      const gerente = gerentes.find(g => g.id === id);
                      if (gerente) handleEditar(gerente, 'gerente');
                    }}
                  />
                </>
              )}

              {activeTab === 'vendedores' && (
                <>
                  <h2 className="text-xl font-bold text-black mb-4">👤 Vendedores Cadastrados</h2>
                  <VendedoresList
                    vendedores={vendedores}
                    onSelecionarVendedor={(vendedor) => handleEditar(vendedor, 'vendedor')}
                    onDeletarVendedor={handleDeletarVendedor}
                    onAtualizarVendedor={(id) => {
                      const vendedor = vendedores.find(v => v.id === id);
                      if (vendedor) handleEditar(vendedor, 'vendedor');
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Estatísticas (visível apenas quando não há formulário) */}
        {!activeForm && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-black-light p-6">
              <h3 className="text-lg font-bold text-black mb-4">📊 Resumo</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-black-medium">Total Lojas</span>
                  <span className="font-bold text-blue-600">{lojas.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-black-medium">Total Gerentes</span>
                  <span className="font-bold text-green-600">{gerentes.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-black-medium">Total Vendedores</span>
                  <span className="font-bold text-purple-600">{vendedores.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-black-medium">Lojas Ativas</span>
                  <span className="font-bold text-orange-600">
                    {lojas.filter(l => l.status === 'ativo').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};