import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { PDFModal } from '../../components/PDFModal/PDFModal';
import { EmailModal } from '../../components/EmailModal/EmailModal';

interface DashboardData {
  metrics: any;
  salesBySeller?: any[];
  topProducts?: any[];
  performanceVendedores?: any[];
  vendasPorDia?: any[];
  periodo: {
    startDate: string;
    endDate: string;
  };
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadDashboard();
  }, [dateRange]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // 🔥 CORREÇÃO: Passar o tipo de usuário para o service
      const dashboardData = await dashboardService.getDashboard(dateRange, user?.tipo || 'VENDEDOR');
      setData(dashboardData);
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return <div>Erro ao carregar dashboard</div>;

  const { metrics, periodo } = data;

  const handleGeneratePDF = async (pdfData: any) => {
    try {
      const response = await dashboardService.generatePDF(pdfData);
      
      // Criar link para download do PDF
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert('✅ PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('❌ Erro ao gerar PDF');
    }
  };

  const handleSendEmail = async (emailData: any) => {
    try {
      const response = await dashboardService.sendEmailReport(emailData);
      alert('✅ E-mail enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      alert('❌ Erro ao enviar e-mail');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
          <p className="text-gray-600">
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
          value={metrics.total_vendas}
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
          title="Clientes Ativos"
          value={metrics.clientes_ativos}
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

      {/* Conteúdo Específico por Tipo de Usuário */}
      {user?.tipo === 'ADMIN' && <AdminDashboard data={data} />}
      {user?.tipo === 'GERENTE' && <GerenteDashboard data={data} />}
      {user?.tipo === 'VENDEDOR' && <VendedorDashboard data={data} />}

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

// Componentes específicos para cada tipo de usuário
const AdminDashboard: React.FC<{ data: DashboardData }> = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Top Vendedores */}
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">🏆 Top Vendedores</h3>
      <div className="space-y-3">
        {data.salesBySeller?.map((vendedor, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>{vendedor.vendedor}</span>
            <span className="font-semibold">{vendedor.total_vendas} vendas</span>
          </div>
        ))}
      </div>
    </div>

    {/* Produtos Mais Vendidos */}
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">📦 Produtos Mais Vendidos</h3>
      <div className="space-y-3">
        {data.topProducts?.map((produto, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="truncate">{produto.descricao}</span>
            <span className="font-semibold">{produto.quantidade_vendida} un</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const GerenteDashboard: React.FC<{ data: DashboardData }> = ({ data }) => (
  <div className="bg-white rounded-lg p-6 border border-gray-200">
    <h3 className="text-lg font-semibold mb-4">👥 Performance da Equipe</h3>
    <div className="space-y-3">
      {data.performanceVendedores?.map((vendedor, index) => (
        <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{vendedor.vendedor}</p>
            <p className="text-sm text-gray-600">{vendedor.total_vendas} vendas</p>
          </div>
          <span className="text-lg font-bold text-success">
            R$ {parseFloat(vendedor.total_vendido).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const VendedorDashboard: React.FC<{ data: DashboardData }> = ({ data }) => (
  <div className="bg-white rounded-lg p-6 border border-gray-200">
    <h3 className="text-lg font-semibold mb-4">📈 Vendas por Dia</h3>
    <div className="space-y-3">
      {data.vendasPorDia?.map((venda, index) => (
        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span>{new Date(venda.dia).toLocaleDateString()}</span>
          <div className="text-right">
            <p className="font-semibold">{venda.total_vendas} vendas</p>
            <p className="text-sm text-success">R$ {parseFloat(venda.total_dia).toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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