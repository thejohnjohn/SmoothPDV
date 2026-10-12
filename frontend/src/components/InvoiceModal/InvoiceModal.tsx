import React, { useCallback, useEffect, useState } from 'react';
import { Download, Printer, Receipt, Smartphone, XCircle } from 'lucide-react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { sellerService } from '../../services/sellerService';
import QrCodeGenerator from '../QrCodeGenerator/QrCodeGenerator';

export interface SaleData {
  id?: number;
  data?: string;
  cliente_nome?: string;
  valor_total?: string | number;
  itens?: unknown[];
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: number | null; // ✅ Corrigido: agora aceita null
  saleData?: SaleData | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  saleId,
  saleData
}) => {
  const [loading, setLoading] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInvoice = useCallback(async () => {
    if (!saleId) {
      setError('ID da venda inválido');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Gerar nota fiscal PDF
      const invoiceBlob = await sellerService.generateInvoice({
        sale_id: saleId
      });

      // Criar URL para o PDF
      const blobUrl = URL.createObjectURL(invoiceBlob);
      setInvoiceUrl(blobUrl);

      // Criar URL para download
      // Você pode criar um endpoint específico no backend ou usar a URL do blob
      const downloadUrl = `http://192.168.0.108:3000/api/download/invoice/${saleId}`;
      setQrCodeUrl(downloadUrl);

    } catch (error) {
      console.error('Erro ao gerar nota fiscal:', error);
      setError('Erro ao gerar nota fiscal. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  // Gerar nota fiscal quando o modal abrir
  useEffect(() => {
    if (isOpen && saleId) {
      generateInvoice();
    } else if (isOpen && !saleId) {
      setError('ID da venda não disponível');
    }
  }, [isOpen, saleId, generateInvoice]);

  const handlePrint = () => {
    if (!invoiceUrl) return;
    
    const printWindow = window.open(invoiceUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownload = () => {
    if (!invoiceUrl) return;
    
    const link = document.createElement('a');
    link.href = invoiceUrl;
    link.download = `nota-fiscal-${saleId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Nota Fiscal"
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-ink-muted">
            <p>Nota fiscal gerada automaticamente pelo sistema Smooth PDV</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <p className="text-ink-muted mb-4">
        {saleId ? `Venda #${saleId}` : 'Venda não identificada'} • 
        {saleData?.data ? new Date(saleData.data).toLocaleDateString('pt-BR') : 'Data não disponível'}
      </p>

      {error ? (
        <div className="text-center py-12">
          <XCircle className="mx-auto mb-4 h-10 w-10 text-error-600" aria-hidden="true" />
          <p className="text-ink-muted mb-4">{error}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={generateInvoice}
          >
            Tentar Novamente
          </Button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-ink-muted">Gerando nota fiscal...</p>
        </div>
      ) : invoiceUrl ? (
        <div className="space-y-6">
          {/* Preview da Nota Fiscal */}
          <div className="bg-surface-muted border border-line rounded-lg p-4">
            <h3 className="font-semibold text-ink mb-2">Prévia da Nota Fiscal</h3>
            <div className="aspect-video bg-surface border border-line-strong rounded flex items-center justify-center">
              <div className="text-center">
                <Receipt className="mx-auto mb-2 h-10 w-10" aria-hidden="true" />
                <p className="text-ink-muted">Nota Fiscal #{saleId}</p>
                <p className="text-sm text-ink-muted mt-1">Clique nos botões abaixo para ações</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-ink-muted">
              <p><strong>Cliente:</strong> {saleData?.cliente_nome || 'Não informado'}</p>
              <p className="tabular-nums"><strong>Valor Total:</strong> R$ {saleData?.valor_total ? parseFloat(String(saleData.valor_total)).toFixed(2) : '0,00'}</p>
              <p><strong>Itens:</strong> {saleData?.itens?.length || 0} produtos</p>
            </div>
          </div>

          {/* QR Code para Download */}
          <div className="bg-secondary-50 border border-secondary-100 rounded-lg p-5">
            <h3 className="flex items-center gap-2 font-semibold text-secondary-700 mb-3">
              <Smartphone className="h-5 w-5" aria-hidden="true" />
              QR Code para Download
            </h3>
            <p className="text-secondary-700 mb-4">
              O cliente pode escanear este QR Code para baixar a nota fiscal no próprio celular.
            </p>
            {qrCodeUrl && (
              <div className="flex flex-col items-center">
                <QrCodeGenerator 
                  url={qrCodeUrl}
                  size={150}
                />
                <p className="text-sm text-secondary-500 mt-3">
                  Escaneie com a câmera do celular
                </p>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="primary"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Imprimir Nota Fiscal
            </Button>
            <Button
              variant="success"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Baixar PDF
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <XCircle className="mx-auto mb-4 h-10 w-10 text-error-600" aria-hidden="true" />
          <p className="text-ink-muted">Não foi possível gerar a nota fiscal.</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={generateInvoice}
          >
            Tentar Novamente
          </Button>
        </div>
      )}
    </Modal>
  );
};
