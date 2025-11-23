import React, { useState } from 'react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: any) => void;
  dashboardData: any;
  user: any;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  onSend,
  dashboardData,
  user
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includePDF, setIncludePDF] = useState(true);

  if (!isOpen) return null;

  const handleSend = () => {
    const emailData = {
      recipientEmail,
      subject: subject || `Relatório Smooth PDV - ${new Date().toLocaleDateString()}`,
      message,
      includePDF,
      dashboardData,
      user
    };

    onSend(emailData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setRecipientEmail('');
    setSubject('');
    setMessage('');
    setIncludePDF(true);
  };

  const defaultSubject = `Relatório ${user?.tipo} - ${dashboardData?.periodo?.startDate} à ${dashboardData?.periodo?.endDate}`;
  const defaultMessage = `Prezado(a),

Segue em anexo o relatório solicitado do período ${dashboardData?.periodo?.startDate} à ${dashboardData?.periodo?.endDate}.

**Resumo:**
- Total de Vendas: ${dashboardData?.metrics?.total_vendas}
- Faturamento: ${formatCurrency(dashboardData?.metrics?.total_faturado)}
- Clientes Ativos: ${dashboardData?.metrics?.clientes_ativos}

Atenciosamente,
${user?.nome}
Smooth PDV`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">📧 Enviar Relatório por E-mail</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Destinatário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail do Destinatário:
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="exemplo@empresa.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Assunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assunto:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={defaultSubject}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={defaultMessage}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Opções */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includePDF"
                checked={includePDF}
                onChange={(e) => setIncludePDF(e.target.checked)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="includePDF" className="text-sm text-gray-700">
                Incluir relatório em PDF como anexo
              </label>
            </div>
          </div>

          {/* Preview do E-mail */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Pré-visualização do E-mail:</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Para:</strong> {recipientEmail || 'exemplo@empresa.com'}</p>
              <p><strong>Assunto:</strong> {subject || defaultSubject}</p>
              <div className="border-t border-gray-200 pt-2">
                <p className="whitespace-pre-line">{message || defaultMessage}</p>
              </div>
              {includePDF && (
                <p className="text-green-600 mt-2">📎 Relatório PDF anexado</p>
              )}
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
              onClick={handleSend}
              disabled={!recipientEmail}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📧 Enviar E-mail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};