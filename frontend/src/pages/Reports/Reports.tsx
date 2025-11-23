import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('vendas');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const { user } = useAuth();

  const reportTypes = [
    {
      id: 'vendas',
      name: '📊 Relatório de Vendas',
      description: 'Detalhamento completo das vendas',
      availableFor: ['ADMIN', 'GERENTE', 'VENDEDOR']
    },
    {
      id: 'produtos',
      name: '📦 Relatório de Produtos',
      description: 'Estoque e performance de produtos',
      availableFor: ['ADMIN', 'GERENTE']
    },
    {
      id: 'financeiro',
      name: '💰 Relatório Financeiro',
      description: 'Fluxo de caixa e receitas',
      availableFor: ['ADMIN', 'GERENTE']
    },
    {
      id: 'clientes',
      name: '👥 Relatório de Clientes',
      description: 'Comportamento e fidelidade',
      availableFor: ['ADMIN', 'GERENTE']
    }
  ];

  const availableReports = reportTypes.filter(report =>
    report.availableFor.includes(user?.tipo || '')
  );

  const generateReport = async (format: 'pdf' | 'excel') => {
    // Implementar geração de relatório
    alert(`Gerando relatório ${reportType} em ${format.toUpperCase()}...`);
  };

  const sendEmailReport = async () => {
    // Implementar envio por email
    alert('Enviando relatório por e-mail...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Gerar relatórios personalizados do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações do Relatório */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configurações do Relatório
            </h2>

            {/* Tipo de Relatório */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Relatório:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableReports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => setReportType(report.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      reportType === report.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{report.name}</p>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inicial:
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Final:
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Gerar Relatório
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => generateReport('pdf')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                📄 Gerar PDF
              </button>
              <button
                onClick={() => generateReport('excel')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                📊 Gerar Excel
              </button>
              <button
                onClick={sendEmailReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                📧 Enviar por E-mail
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pré-visualização
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <p className="text-gray-600 font-medium">
              {availableReports.find(r => r.id === reportType)?.name}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Período: {dateRange.startDate} à {dateRange.endDate}
            </p>
            <p className="text-gray-400 text-xs mt-4">
              Clique em gerar para visualizar o relatório completo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};