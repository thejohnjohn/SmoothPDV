import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Lightbulb, Plus, RefreshCw, XCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useVendedoresGerente } from '../../../hooks/useVendedoresGerente';
import { VendedoresListGerente } from '../../../components/features/gerente/VendedoresListGerente/VendedoresListGerente';
import { VendedorFormGerente } from '../../../components/features/gerente/VendedorFormGerente/VendedorFormGerente';
import { Badge } from '../../../components/ui/Badge/Badge';
import { Button } from '../../../components/ui/Button/Button';
import { Card } from '../../../components/ui/Card/Card';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog/ConfirmDialog';
import { ErrorState } from '../../../components/ui/ErrorState/ErrorState';
import { PageHeader } from '../../../components/ui/PageHeader/PageHeader';
import { useToast } from '../../../components/ui/Toast/useToast';
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

  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [vendedorParaRemover, setVendedorParaRemover] = useState<number | null>(null);

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

  const handleDeletarVendedor = (id: number) => {
    setVendedorParaRemover(id);
  };

  const handleConfirmarRemocao = async () => {
    if (vendedorParaRemover === null) return;
    const id = vendedorParaRemover;
    setVendedorParaRemover(null);
    try {
      await deleteVendedor(id);
    } catch (err) {
      console.error('Erro ao deletar vendedor:', err);
      showToast('Erro ao remover vendedor. Tente novamente.', 'error');
    }
  };

  const handleAtualizarStatus = async (id: number, status: 'ativo' | 'inativo') => {
    try {
      await toggleVendedorStatus(id, status);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      showToast('Erro ao alterar status do vendedor.', 'error');
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
      <PageHeader
        title="Gerenciar Vendedores"
        subtitle="Gerencie a equipe de vendedores da sua loja"
        actions={
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={loadVendedores}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </Button>

            {!showForm && (
              <Button
                size="lg"
                onClick={handleAdicionarVendedor}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Adicionar Vendedor
              </Button>
            )}
          </>
        }
      />

      {error && (
        <ErrorState
          title="Erro ao carregar vendedores"
          message={error}
          onRetry={loadVendedores}
        />
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
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-ink">
                  Equipe de Vendedores ({stats.total})
                </h2>

                <div className="flex gap-4 text-sm">
                  <Badge tone="success">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {stats.ativos} ativos
                  </Badge>
                  <Badge tone="error">
                    <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {stats.inativos} inativos
                  </Badge>
                </div>
              </div>

              <VendedoresListGerente
                vendedores={vendedores}
                onSelecionarVendedor={handleEditarVendedor}
                onDeletarVendedor={handleDeletarVendedor}
                onAtualizarStatus={handleAtualizarStatus}
                loading={loading}
              />
            </Card>
          )}
        </div>

        {/* Estatísticas (visível apenas quando não há formulário) */}
        {!showForm && (
          <div className="lg:col-span-1 space-y-6">
            {/* Cartão de Estatísticas */}
            <Card>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
                Resumo da Equipe
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary-50 rounded-lg">
                  <span className="text-ink-muted">Total Vendedores</span>
                  <span className="font-bold text-secondary-700 text-xl">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                  <span className="text-ink-muted">Vendedores Ativos</span>
                  <span className="font-bold text-success-700 text-xl">{stats.ativos}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-error-50 rounded-lg">
                  <span className="text-ink-muted">Vendedores Inativos</span>
                  <span className="font-bold text-error-600 text-xl">{stats.inativos}</span>
                </div>
              </div>
            </Card>

            {/* Dicas Rápidas */}
            <Card>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-warning-600">
                <Lightbulb className="h-5 w-5" aria-hidden="true" />
                Dicas
              </h3>
              <ul className="space-y-2 text-sm text-ink-muted">
                <li>• Vendedores ativos podem acessar o PDV</li>
                <li>• Vendedores inativos não conseguem fazer login</li>
                <li>• Cada vendedor tem suas próprias vendas e relatórios</li>
                <li>• Monitore o desempenho da sua equipe no Dashboard</li>
              </ul>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={vendedorParaRemover !== null}
        title="Remover vendedor"
        message="Tem certeza que deseja remover este vendedor da sua loja?"
        confirmLabel="Remover"
        onConfirm={handleConfirmarRemocao}
        onCancel={() => setVendedorParaRemover(null)}
      />
    </div>
  );
};
