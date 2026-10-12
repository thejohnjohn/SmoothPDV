import React, { useState } from 'react';
import { Banknote, BarChart3, CreditCard, Rocket, TrendingUp } from 'lucide-react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';

export interface PDFDashboardData {
  periodo?: {
    startDate?: string;
    endDate?: string;
  };
}

export interface PDFUser {
  tipo?: string;
  nome?: string;
}

export interface PDFData {
  title: string;
  reportType: string;
  includeCharts: boolean;
  data: PDFDashboardData | null;
  user: PDFUser | null;
  generatedAt: string;
}

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (pdfData: PDFData) => void;
  dashboardData: PDFDashboardData | null;
  user: PDFUser | null;
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
    { id: 'completo', name: 'Relatório Completo', description: 'Todas as métricas e dados', icon: BarChart3 },
    { id: 'vendas', name: 'Foco em Vendas', description: 'Apenas dados de vendas', icon: Banknote },
    { id: 'financeiro', name: 'Análise Financeira', description: 'Dados financeiros detalhados', icon: CreditCard },
    { id: 'simples', name: 'Resumo Executivo', description: 'Apenas métricas principais', icon: TrendingUp }
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
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Gerar Relatório PDF"
      size="sm"
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleGenerate}>
            <Rocket className="h-4 w-4" aria-hidden="true" />
            Gerar PDF
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Título do Relatório */}
        <Input
          label="Título do Relatório:"
          type="text"
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
          placeholder={`Relatório ${user?.tipo} - ${new Date().toLocaleDateString()}`}
        />

        {/* Tipo de Relatório */}
        <div>
          <label className="block text-sm font-semibold text-ink mb-3">
            Tipo de Relatório:
          </label>
          <div className="space-y-2">
            {reportTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  reportType === type.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <p className="flex items-center gap-2 font-medium text-ink">
                  <type.icon className="h-4 w-4" aria-hidden="true" />
                  {type.name}
                </p>
                <p className="text-sm text-ink-muted">{type.description}</p>
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
            className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-line rounded"
          />
          <label htmlFor="includeCharts" className="text-sm text-ink">
            Incluir gráficos e visualizações
          </label>
        </div>

        {/* Preview */}
        <div className="bg-surface-muted rounded-lg p-4">
          <h4 className="font-medium text-ink mb-2">Pré-visualização:</h4>
          <div className="text-sm text-ink-muted space-y-1">
            <p>• {reportTypes.find(t => t.id === reportType)?.name}</p>
            <p>• Período: {dashboardData?.periodo?.startDate} à {dashboardData?.periodo?.endDate}</p>
            <p>• {includeCharts ? 'Com gráficos' : 'Sem gráficos'}</p>
            <p>• Gerado por: {user?.nome}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
