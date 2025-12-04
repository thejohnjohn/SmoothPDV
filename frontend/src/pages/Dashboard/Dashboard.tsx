import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { reportService } from '../../services/reportService';
import { emailService } from '../../services/emailService';
import { PDFModal } from '../../components/PDFModal/PDFModal';
import { EmailModal } from '../../components/EmailModal/EmailModal';

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

  // ✅ Verificar se é gerente
  useEffect(() => {
    if (user?.tipo !== 'GERENTE') {
      window.location.href = '/';
      return;
    }
  }, [user]);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.tipo === 'GERENTE') {
      loadDashboard();
    }
  }, [dateRange, user]);

  const loadDashboard = async () => {
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
  };

  // ✅ Usar reportService para gerar PDF
  const handleGeneratePDF = async (pdfData: any) => {
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
      
      alert('✅ PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('❌ Erro ao gerar PDF');
    }
  };

  // ✅ Usar emailService para enviar e-mail
 const handleSendEmail = async (emailData: any) => {
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
      alert('✅ E-mail enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      alert('❌ Erro ao enviar e-mail');
    }
  };

  // ✅ Se não for gerente, não mostra nada
  if (user?.tipo !== 'GERENTE') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <p className="text-gray-600">Acesso restrito apenas para gerentes</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return <div>Erro ao carregar dashboard</div>;

  const { metrics, periodo, loja } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard Gerente</h1>
          <p className="text-gray-600">
            {loja?.nome && <span className="font-bold">{loja.nome} • </span>}
            Período: {new Date(periodo.startDate).toLocaleDateString()} à {new Date(periodo.endDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={loadDashboard}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Vendas"
          value={metrics.total_vendas || 0}
          icon="💰"
          color="blue"
        />
        <MetricCard
          title="Faturamento Total"
          value={`R$ ${parseFloat(metrics.total_faturado || 0).toFixed(2)}`}
          icon="📈"
          color="green"
        />
        <MetricCard
          title="Vendedores Ativos"
          value={metrics.vendedores_ativos || metrics.total_vendedores || 0}
          icon="👥"
          color="purple"
        />
        <MetricCard
          title="Ticket Médio"
          value={`R$ ${parseFloat(metrics.ticket_medio || 0).toFixed(2)}`}
          icon="🎫"
          color="orange"
        />
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance da Equipe */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">👥 Performance da Equipe</h3>
          <div className="space-y-3">
            {data.performance_vendedores?.map((vendedor, index) => (
              <div key={vendedor.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{vendedor.vendedor}</p>
                  <p className="text-sm text-gray-600">{vendedor.total_vendas} vendas</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    R$ {parseFloat(vendedor.total_vendido || 0).toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-500">
                    Ticket: R$ {parseFloat(vendedor.ticket_medio || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">💳 Métodos de Pagamento</h3>
          <div className="space-y-3">
            {data.metodos_pagamento?.map((metodo, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{getPaymentMethodName(metodo.metodo_pagamento)}</span>
                <div className="text-right">
                  <p className="font-semibold">{metodo.total_vendas} vendas</p>
                  <p className="text-sm text-green-600">R$ {parseFloat(metodo.total_valor || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">📦 Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {data.produtos_mais_vendidos?.map((produto, index) => (
              <div key={produto.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium truncate">{produto.descricao}</p>
                  <p className="text-sm text-gray-600">R$ {parseFloat(produto.preco || 0).toFixed(2)} cada</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold">{produto.quantidade_vendida} un</p>
                  <p className="text-sm text-green-600">R$ {parseFloat(produto.faturamento_total || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendas por Dia */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">📈 Vendas por Dia</h3>
          <div className="space-y-3">
            {data.vendas_por_dia?.map((venda, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>{new Date(venda.dia).toLocaleDateString('pt-BR')}</span>
                <div className="text-right">
                  <p className="font-semibold">{venda.total_vendas} vendas</p>
                  <p className="text-sm text-green-600">R$ {parseFloat(venda.total_dia || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            🖨️ Imprimir Relatório
          </button>
          <button
            onClick={() => setShowPDFModal(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            📄 Gerar PDF
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            📧 Enviar por E-mail
          </button>
        </div>
      </div>

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
    'DINHEIRO': '💰 Dinheiro',
    'CARTAO_DEBITO': '💳 Cartão Débito', 
    'CARTAO_CREDITO': '💳 Cartão Crédito',
    'PIX': '📱 Pix',
    'BOLETO': '🏦 Boleto'
  };
  return methods[method] || method;
};

// Componente de Card de Métrica
const MetricCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({
  title,
  value,
  icon,
  color
}) => {
  const colorClasses: any = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color]} text-white p-3 rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};