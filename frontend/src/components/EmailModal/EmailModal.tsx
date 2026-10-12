import React, { useState } from 'react';
import { Mail, Paperclip } from 'lucide-react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';
import { formatCurrency } from '../../utils/formatters';

export interface EmailDashboardData {
  periodo?: {
    startDate?: string;
    endDate?: string;
  };
  metrics?: {
    total_vendas?: string | number;
    total_faturado?: string | number;
    clientes_ativos?: string | number;
  };
}

export interface EmailUser {
  tipo?: string;
  nome?: string;
}

export interface EmailData {
  recipientEmail: string;
  subject: string;
  message: string;
  includePDF: boolean;
  dashboardData: EmailDashboardData | null;
  user: EmailUser | null;
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (emailData: EmailData) => void;
  dashboardData: EmailDashboardData | null;
  user: EmailUser | null;
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
- Faturamento: ${formatCurrency(Number(dashboardData?.metrics?.total_faturado ?? 0))}
- Clientes Ativos: ${dashboardData?.metrics?.clientes_ativos}

Atenciosamente,
${user?.nome}
Smooth PDV`;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Enviar Relatório por E-mail"
      size="lg"
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSend} disabled={!recipientEmail}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Enviar E-mail
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Destinatário */}
        <Input
          label="E-mail do Destinatário:"
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="exemplo@empresa.com"
          required
        />

        {/* Assunto */}
        <Input
          label="Assunto:"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={defaultSubject}
        />

        {/* Mensagem */}
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            Mensagem:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={defaultMessage}
            rows={8}
            className="w-full px-4 py-3 border border-line bg-surface text-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-line rounded"
            />
            <label htmlFor="includePDF" className="text-sm text-ink">
              Incluir relatório em PDF como anexo
            </label>
          </div>
        </div>

        {/* Preview do E-mail */}
        <div className="bg-surface-muted rounded-lg p-4 border border-line">
          <h4 className="font-medium text-ink mb-3">Pré-visualização do E-mail:</h4>
          <div className="text-sm text-ink-muted space-y-2">
            <p><strong>Para:</strong> {recipientEmail || 'exemplo@empresa.com'}</p>
            <p><strong>Assunto:</strong> {subject || defaultSubject}</p>
            <div className="border-t border-line pt-2">
              <p className="whitespace-pre-line">{message || defaultMessage}</p>
            </div>
            {includePDF && (
              <p className="text-success-600 mt-2 flex items-center gap-2">
                <Paperclip className="h-4 w-4" aria-hidden="true" />
                Relatório PDF anexado
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
