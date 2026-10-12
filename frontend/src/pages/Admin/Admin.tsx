import React, { useState, useEffect } from 'react';
import { BarChart3, Briefcase, Building2, ClipboardList, Plus, RefreshCw, User } from 'lucide-react';
import { ListaLojas } from '../../components/features/admin/ListaLojas/ListaLojas';
import { GerentesList } from '../../components/features/admin/GerentesList/GerentesList';
import { VendedoresList } from '../../components/features/admin/VendedoresList/VendedoresList';
import { LojaForm } from '../../components/features/admin/LojaForm/LojaForm';
import { GerenteForm } from '../../components/features/admin/GerenteForm/GerenteForm';
import { VendedorForm } from '../../components/features/admin/VendedorForm/VendedorForm';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog/ConfirmDialog';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';
import { useToast } from '../../components/ui/Toast/useToast';
import type { Loja, Gerente, Vendedor, VendedorCreateData, GerenteCreateData } from '../../types/admin';
import { adminService } from '../../services/adminService';

type ActiveTab = 'lojas' | 'gerentes' | 'vendedores';
type ActiveForm = 'loja' | 'gerente' | 'vendedor' | null;

const deleteMessages: Record<ActiveTab, string> = {
  lojas: 'Tem certeza que deseja deletar esta loja?',
  gerentes: 'Tem certeza que deseja deletar este gerente?',
  vendedores: 'Tem certeza que deseja deletar este vendedor?',
};

const deleteTitles: Record<ActiveTab, string> = {
  lojas: 'Excluir loja',
  gerentes: 'Excluir gerente',
  vendedores: 'Excluir vendedor',
};

export const Admin: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('lojas');
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [selectedItem, setSelectedItem] = useState<Loja | Gerente | Vendedor | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ tab: ActiveTab; id: number } | null>(null);

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
      showToast('Erro ao salvar loja. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarLoja = (id: number) => {
    setDeleteTarget({ tab: 'lojas', id });
  };

  // Handlers para Gerentes
  const handleSalvarGerente = async (data: GerenteCreateData) => {
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
      showToast('Erro ao salvar gerente. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarGerente = (id: number) => {
    setDeleteTarget({ tab: 'gerentes', id });
  };

  // Handlers para Vendedores
  // Handlers para Vendedores
const handleSalvarVendedor = async (data: VendedorCreateData) => {
  setLoading(true);
  try {
    // 🆕 CORREÇÃO: Garantir que id_loja está presente e é number
    const vendedorData: VendedorCreateData = {
      ...data,
      id_loja: data.id_loja || parseInt(data.loja_id as string)
    };

    console.log('💾 Salvando vendedor:', vendedorData);

    if (selectedItem) {
      // 🆕 CORREÇÃO: Passar apenas os dados necessários para update
      const updateData: Partial<VendedorCreateData> = {
        nome: vendedorData.nome,
        email: vendedorData.email,
        id_loja: vendedorData.id_loja,
        status: vendedorData.status
      };

      // 🆕 CORREÇÃO: Incluir senha apenas se foi preenchida
      if (vendedorData.senha) {
        updateData.senha = vendedorData.senha;
      }

      const vendedorAtualizado = await adminService.updateVendedor(selectedItem.id, updateData);
      setVendedores(prev => prev.map(v => v.id === selectedItem.id ? vendedorAtualizado : v));
    } else {
      // 🆕 CORREÇÃO: Para criação, enviar todos os dados incluindo senha
      const novoVendedor = await adminService.createVendedor(vendedorData);
      setVendedores(prev => [...prev, novoVendedor]);
    }
    
    setActiveForm(null);
    setSelectedItem(null);
  } catch (error) {
    console.error('Erro ao salvar vendedor:', error);
    showToast('Erro ao salvar vendedor. Tente novamente.', 'error');
  } finally {
    setLoading(false);
  }
};

  const handleDeletarVendedor = (id: number) => {
    setDeleteTarget({ tab: 'vendedores', id });
  };

  const handleConfirmarExclusao = async () => {
    if (!deleteTarget) return;
    const { tab, id } = deleteTarget;
    setDeleteTarget(null);

    if (tab === 'lojas') {
      try {
        await adminService.deleteLoja(id);
        setLojas(prev => prev.filter(l => l.id !== id));
      } catch (error) {
        console.error('Erro ao deletar loja:', error);
        showToast('Erro ao deletar loja. Tente novamente.', 'error');
      }
      return;
    }

    if (tab === 'gerentes') {
      try {
        await adminService.deleteGerente(id);
        setGerentes(prev => prev.filter(g => g.id !== id));
      } catch (error) {
        console.error('Erro ao deletar gerente:', error);
        showToast('Erro ao deletar gerente. Tente novamente.', 'error');
      }
      return;
    }

    try {
      await adminService.deleteVendedor(id);
      setVendedores(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Erro ao deletar vendedor:', error);
      showToast('Erro ao deletar vendedor. Tente novamente.', 'error');
    }
  };

  const tabs = [
    { id: 'lojas' as ActiveTab, label: 'Lojas', icon: Building2 },
    { id: 'gerentes' as ActiveTab, label: 'Gerentes', icon: Briefcase },
    { id: 'vendedores' as ActiveTab, label: 'Vendedores', icon: User },
  ];

  // Estado de loading geral
  if (dataLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <LoadingState label="Carregando dados..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Painel Administrativo"
        subtitle="Gerencie lojas, gerentes e vendedores do sistema"
        actions={
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={carregarDados}
              disabled={dataLoading}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </Button>
            
            {!activeForm && (
              <Button
                size="lg"
                onClick={() => handleAdicionar(activeTab === 'lojas' ? 'loja' : activeTab === 'gerentes' ? 'gerente' : 'vendedor')}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Adicionar {activeTab === 'lojas' ? 'Loja' : activeTab === 'gerentes' ? 'Gerente' : 'Vendedor'}
              </Button>
            )}
          </>
        }
      />

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

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estatísticas (visível apenas quando não há formulário) */}
        {!activeForm && (
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
                Resumo
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                  <span className="text-ink-muted">Total Lojas</span>
                  <span className="font-bold text-secondary-700">{lojas.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                  <span className="text-ink-muted">Total Gerentes</span>
                  <span className="font-bold text-success-700">{gerentes.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-ink-muted">Total Vendedores</span>
                  <span className="font-bold text-primary-700">{vendedores.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-warning-50 rounded-lg">
                  <span className="text-ink-muted">Lojas Ativas</span>
                  <span className="font-bold text-warning-600">
                    {lojas.filter(l => l.status === 'ativo').length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
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
            <Card>
              {activeTab === 'lojas' && (
                <>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-ink">
                    <ClipboardList className="h-5 w-5" aria-hidden="true" />
                    Lojas Cadastradas
                  </h2>
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
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-ink">
                    <Briefcase className="h-5 w-5" aria-hidden="true" />
                    Gerentes Cadastrados
                  </h2>
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
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-ink">
                    <User className="h-5 w-5" aria-hidden="true" />
                    Vendedores Cadastrados
                  </h2>
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
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteTarget ? deleteTitles[deleteTarget.tab] : ''}
        message={deleteTarget ? deleteMessages[deleteTarget.tab] : ''}
        confirmLabel="Excluir"
        onConfirm={handleConfirmarExclusao}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
