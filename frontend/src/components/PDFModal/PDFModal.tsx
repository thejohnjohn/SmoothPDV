import React, { useState } from 'react';

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (pdfData: any) => void;
  dashboardData: any;
  user: any;
}

export const PDFModal: React.FC<PDFModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  dashboardData,
  user
}) => {
  const [reportTitle, setReportTitle] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [reportType, setReportType] = useState('completo');

  if (!isOpen) return null;

  const reportTypes = [
    { id: 'completo', name: '📊 Relatório Completo', description: 'Todas as métricas e dados' },
    { id: 'vendas', name: '💰 Foco em Vendas', description: 'Apenas dados de vendas' },
    { id: 'financeiro', name: '💳 Análise Financeira', description: 'Dados financeiros detalhados' },
    { id: 'simples', name: '📈 Resumo Executivo', description: 'Apenas métricas principais' }
  ];

  const handleGenerate = () => {
    const pdfData = {
      title: reportTitle || `Relatório ${user?.tipo} - ${new Date().toLocaleDateString()}`,
      reportType,
      includeCharts,
      data: dashboardData,
      user: user,
      generatedAt: new Date().toISOString()
    };

    onGenerate(pdfData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">📄 Gerar Relatório PDF</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Título do Relatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Relatório:
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder={`Relatório ${user?.tipo} - ${new Date().toLocaleDateString()}`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Tipo de Relatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Relatório:
            </label>
            <div className="space-y-2">
              {reportTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    reportType === type.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{type.name}</p>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Opções */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeCharts"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="includeCharts" className="text-sm text-gray-700">
              Incluir gráficos e visualizações
            </label>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Pré-visualização:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• {reportTypes.find(t => t.id === reportType)?.name}</p>
              <p>• Período: {dashboardData?.periodo?.startDate} à {dashboardData?.periodo?.endDate}</p>
              <p>• {includeCharts ? 'Com gráficos' : 'Sem gráficos'}</p>
              <p>• Gerado por: {user?.nome}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-bold transition-colors"
            >
              🚀 Gerar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};