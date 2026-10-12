import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ban,
  Banknote,
  CreditCard,
  FileText,
  Landmark,
  Mail,
  Package,
  Printer,
  RefreshCw,
  Smartphone,
  Ticket,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { reportService } from '../../services/reportService';
import { PDFModal } from '../../components/PDFModal/PDFModal';
import { EmailModal } from '../../components/EmailModal/EmailModal';
import type { EmailData } from '../../components/EmailModal/EmailModal';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';
import { StatCard } from '../../components/ui/StatCard/StatCard';
import { useToast } from '../../components/ui/Toast/useToast';

interface DashboardData {
  periodo: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    total_vendas: string;
    total_faturado: string;
    vendedores_ativos: string;
    total_vendedores: string;
    total_produtos: string;
    ticket_medio: string;
    dias_com_vendas: number;
    produtos_mais_vendidos_count: number;
  };
  vendas_por_dia?: Array<{
    dia: string;
    total_vendas: string;
    total_dia: string;
  }>;
  performance_vendedores?: Array<{
    id: number;
    vendedor: string;
    total_vendas: string;
    total_vendido: string;
    ticket_medio: string;
  }>;
  metodos_pagamento?: Array<{
    metodo_pagamento: string;
    total_vendas: string;
    total_valor: string;
  }>;
  produtos_mais_vendidos?: Array<{
    id: number;
    descricao: string;
    preco: string;
    quantidade_vendida: string;
    faturamento_total: string;
  }>;
  loja?: {
    id: number;
    nome: string;
  };
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // ✅ Verificar se é gerente
  useEffect(() => {
    if (user?.tipo !== 'GERENTE') {
      navigate('/');
      return;
    }
  }, [navigate, user]);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ Usar os métodos específicos por tipo de usuário
      let dashboardData;
      switch (user?.tipo) {
        case 'ADMIN':
          dashboardData = await dashboardService.getAdminDashboard(dateRange);
          break;
        case 'GERENTE':
          // ✅ Chamar o dashboard do gerente
          dashboardData = await dashboardService.getGerenteDashboard(dateRange);
          break;
        case 'VENDEDOR':
          dashboardData = await dashboardService.getVendedorDashboard(dateRange);
          break;
        default:
          dashboardData = null;
      }

      setData(dashboardData);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, user]);

  useEffect(() => {
    if (user?.tipo === 'GERENTE') {
      loadDashboard();
    }
  }, [dateRange, user, loadDashboard]);

  const toNumber = (value: string | number | undefined) => parseFloat(String(value ?? 0));

  // ✅ Usar reportService para gerar PDF
  const handleGeneratePDF = async () => {
    try {
      const reportData = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: 'vendas' as const,
        filters: {
          userType: user?.tipo,
          metrics: data?.metrics
        }
      };

      const pdfBlob = await reportService.generatePDF(reportData);

      // Criar link para download do PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${dateRange.startDate}-${dateRange.endDate}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      showToast('PDF gerado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showToast('Erro ao gerar PDF', 'error');
    }
  };

  // ✅ Usar emailService para enviar e-mail
  const handleSendEmail = async (emailData: EmailData) => {
    try {
      const reportPayload = {
        recipientEmail: emailData.recipientEmail,
        subject: emailData.subject || `Relatório Dashboard - ${dateRange.startDate} à ${dateRange.endDate}`,
        message: emailData.message,
        dashboardData: data, // ✅ ENVIANDO OS DADOS COMPLETOS DO DASHBOARD
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: 'vendas' as const
      };

      console.log('📤 Enviando e-mail com payload:', reportPayload);

      // ✅ Manter reportService.sendEmail() mas com payload correto
      await reportService.sendEmail(reportPayload);
      showToast('E-mail enviado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      showToast('Erro ao enviar e-mail', 'error');
    }
  };

  // ✅ Se não for gerente, não mostra nada
  if (user?.tipo !== 'GERENTE') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Ban className="mx-auto mb-4 h-10 w-10 text-ink-muted" aria-hidden="true" />
          <p className="text-ink-muted">Acesso restrito apenas para gerentes</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return <ErrorState title="Erro ao carregar dashboard" onRetry={loadDashboard} />;
  }

  const { metrics, periodo, loja } = data;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard Gerente"
        subtitle={`${loja?.nome ? `${loja.nome} • ` : ''}Período: ${new Date(periodo.startDate).toLocaleDateString()} à ${new Date(periodo.endDate).toLocaleDateString()}`}
        actions={
          <>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            />
            <Button onClick={loadDashboard}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Atualizar
            </Button>
          </>
        }
      />

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total de Vendas"
          value={metrics.total_vendas || 0}
          icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
          tone="secondary"
        />
        <StatCard
          label="Faturamento Total"
          value={`R$ ${toNumber(metrics.total_faturado).toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5" aria-hidden="true" />}
          tone="success"
        />
        <StatCard
          label="Vendedores Ativos"
          value={metrics.vendedores_ativos || metrics.total_vendedores || 0}
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          tone="primary"
        />
        <StatCard
          label="Ticket Médio"
          value={`R$ ${toNumber(metrics.ticket_medio).toFixed(2)}`}
          icon={<Ticket className="h-5 w-5" aria-hidden="true" />}
          tone="warning"
        />
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance da Equipe */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
            <Users className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            Performance da Equipe
          </h3>
          <div className="space-y-3">
            {data.performance_vendedores?.map((vendedor) => (
              <div key={vendedor.id} className="flex justify-between items-center p-4 bg-surface-muted rounded-lg">
                <div>
                  <p className="font-medium">{vendedor.vendedor}</p>
                  <p className="text-sm text-ink-muted">{vendedor.total_vendas} vendas</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-success-600">
                    R$ {toNumber(vendedor.total_vendido).toFixed(2)}
                  </span>
                  <p className="text-xs text-ink-muted">
                    Ticket: R$ {toNumber(vendedor.ticket_medio).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Métodos de Pagamento */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
            <CreditCard className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            Métodos de Pagamento
          </h3>
          <div className="space-y-3">
            {data.metodos_pagamento?.map((metodo, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-surface-muted rounded">
                <span className="flex items-center gap-2 font-medium">
                  {getPaymentMethodIcon(metodo.metodo_pagamento)}
                  {getPaymentMethodName(metodo.metodo_pagamento)}
                </span>
                <div className="text-right">
                  <p className="font-semibold">{metodo.total_vendas} vendas</p>
                  <p className="text-sm text-success-600">R$ {toNumber(metodo.total_valor).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Produtos Mais Vendidos */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
            <Package className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            Produtos Mais Vendidos
          </h3>
          <div className="space-y-3">
            {data.produtos_mais_vendidos?.map((produto) => (
              <div key={produto.id} className="flex justify-between items-center p-3 bg-surface-muted rounded">
                <div className="flex-1">
                  <p className="font-medium truncate">{produto.descricao}</p>
                  <p className="text-sm text-ink-muted">R$ {toNumber(produto.preco).toFixed(2)} cada</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold">{produto.quantidade_vendida} un</p>
                  <p className="text-sm text-success-600">R$ {toNumber(produto.faturamento_total).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Vendas por Dia */}
        <Card>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
            <TrendingUp className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            Vendas por Dia
          </h3>
          <div className="space-y-3">
            {data.vendas_por_dia?.map((venda, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-surface-muted rounded">
                <span>{new Date(venda.dia).toLocaleDateString('pt-BR')}</span>
                <div className="text-right">
                  <p className="font-semibold">{venda.total_vendas} vendas</p>
                  <p className="text-sm text-success-600">R$ {toNumber(venda.total_dia).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Ações */}
      <Card>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.print()}
          >
            <Printer className="h-5 w-5" aria-hidden="true" />
            Imprimir Relatório
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => setShowPDFModal(true)}
          >
            <FileText className="h-5 w-5" aria-hidden="true" />
            Gerar PDF
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowEmailModal(true)}
          >
            <Mail className="h-5 w-5" aria-hidden="true" />
            Enviar por E-mail
          </Button>
        </div>
      </Card>

      {/* Modais */}
      <PDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        onGenerate={handleGeneratePDF}
        dashboardData={data}
        user={user}
      />

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleSendEmail}
        dashboardData={data}
        user={user}
      />
    </div>
  );
};

// ✅ Função para nomear métodos de pagamento
const getPaymentMethodName = (method: string) => {
  const methods: { [key: string]: string } = {
    'DINHEIRO': 'Dinheiro',
    'CARTAO_DEBITO': 'Cartão Débito',
    'CARTAO_CREDITO': 'Cartão Crédito',
    'PIX': 'Pix',
    'BOLETO': 'Boleto'
  };
  return methods[method] || method;
};

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'DINHEIRO':
      return <Banknote className="h-4 w-4" aria-hidden="true" />;
    case 'CARTAO_DEBITO':
    case 'CARTAO_CREDITO':
      return <CreditCard className="h-4 w-4" aria-hidden="true" />;
    case 'PIX':
      return <Smartphone className="h-4 w-4" aria-hidden="true" />;
    case 'BOLETO':
      return <Landmark className="h-4 w-4" aria-hidden="true" />;
    default:
      return null;
  }
};
