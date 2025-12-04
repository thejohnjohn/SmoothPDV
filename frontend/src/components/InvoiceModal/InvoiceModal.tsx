import React, { useState, useEffect } from 'react';
import { sellerService } from '../../services/sellerService';
import QrCodeGenerator from '../QrCodeGenerator/QrCodeGenerator';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: number | null; // ✅ Corrigido: agora aceita null
  saleData?: any;
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

  // Gerar nota fiscal quando o modal abrir
  useEffect(() => {
    if (isOpen && saleId) {
      generateInvoice();
    } else if (isOpen && !saleId) {
      setError('ID da venda não disponível');
    }
  }, [isOpen, saleId]);

  const generateInvoice = async () => {
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
  };

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📄 Nota Fiscal</h2>
            <p className="text-gray-600 mt-1">
              {saleId ? `Venda #${saleId}` : 'Venda não identificada'} • 
              {saleData?.data ? new Date(saleData.data).toLocaleDateString('pt-BR') : 'Data não disponível'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={generateInvoice}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Gerando nota fiscal...</p>
            </div>
          ) : invoiceUrl ? (
            <div className="space-y-6">
              {/* Preview da Nota Fiscal */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Prévia da Nota Fiscal</h3>
                <div className="aspect-video bg-white border border-gray-300 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🧾</div>
                    <p className="text-gray-600">Nota Fiscal #{saleId}</p>
                    <p className="text-sm text-gray-500 mt-1">Clique nos botões abaixo para ações</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>Cliente:</strong> {saleData?.cliente_nome || 'Não informado'}</p>
                  <p><strong>Valor Total:</strong> R$ {saleData?.valor_total ? parseFloat(saleData.valor_total).toFixed(2) : '0,00'}</p>
                  <p><strong>Itens:</strong> {saleData?.itens?.length || 0} produtos</p>
                </div>
              </div>

              {/* QR Code para Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h3 className="font-semibold text-blue-900 mb-3">📱 QR Code para Download</h3>
                <p className="text-blue-700 mb-4">
                  O cliente pode escanear este QR Code para baixar a nota fiscal no próprio celular.
                </p>
                {qrCodeUrl && (
                  <div className="flex flex-col items-center">
                    <QrCodeGenerator 
                      url={qrCodeUrl}
                      size={150}
                    />
                    <p className="text-sm text-blue-600 mt-3">
                      Escaneie com a câmera do celular
                    </p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  🖨️ Imprimir Nota Fiscal
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  ⬇️ Baixar PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">❌</div>
              <p className="text-gray-600">Não foi possível gerar a nota fiscal.</p>
              <button
                onClick={generateInvoice}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Nota fiscal gerada automaticamente pelo sistema Smooth PDV</p>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};