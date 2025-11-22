import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: any) => void;
  total: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  total
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('DINHEIRO');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [observation, setObservation] = useState<string>('');

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'DINHEIRO', name: '💰 Dinheiro', description: 'Pagamento em espécie' },
    { id: 'CARTAO_DEBITO', name: '💳 Cartão Débito', description: 'Cartão de débito' },
    { id: 'CARTAO_CREDITO', name: '💳 Cartão Crédito', description: 'Cartão de crédito' },
    { id: 'PIX', name: '📱 Pix', description: 'Transferência instantânea' },
    { id: 'BOLETO', name: '🏦 Boleto', description: 'Pagamento via boleto' },
  ];

  const calculateChange = () => {
    if (selectedMethod !== 'DINHEIRO' || !amountPaid) return 0;
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - total);
  };

  const handleConfirm = () => {
    const paymentData = {
      metodo_pagamento: selectedMethod,
      valor_pago: selectedMethod === 'DINHEIRO' ? parseFloat(amountPaid) || total : total,
      troco: calculateChange(),
      observacao: observation
    };

    onConfirm(paymentData);
    resetForm();
  };

  const resetForm = () => {
    setAmountPaid('');
    setObservation('');
  };

  const change = calculateChange();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">💳 Finalizar Pagamento</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="mt-2">
            <p className="text-lg font-bold text-success">
              Total: R$ {total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Métodos de Pagamento */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Selecione a forma de pagamento:</h3>
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedMethod === method.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Valor Pago (apenas para dinheiro) */}
          {selectedMethod === 'DINHEIRO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Recebido:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min={total}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder={total.toFixed(2)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-medium"
                />
              </div>
              {change > 0 && (
                <p className="mt-2 text-lg font-bold text-success">
                  Troco: R$ {change.toFixed(2)}
                </p>
              )}
              {amountPaid && parseFloat(amountPaid) < total && (
                <p className="mt-2 text-error text-sm">
                  Valor insuficiente. Faltam: R$ {(total - parseFloat(amountPaid)).toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Observação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observação (opcional):
            </label>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ex: Cliente preferencial, desconto especial..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Resumo do Pagamento */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Resumo do Pagamento:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total da Venda:</span>
                <span className="font-medium">R$ {total.toFixed(2)}</span>
              </div>
              {selectedMethod === 'DINHEIRO' && amountPaid && (
                <>
                  <div className="flex justify-between">
                    <span>Valor Pago:</span>
                    <span className="font-medium">R$ {parseFloat(amountPaid).toFixed(2)}</span>
                  </div>
                  {change > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Troco:</span>
                      <span className="font-bold">R$ {change.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span>Forma de Pagamento:</span>
                <span className="font-medium">
                  {paymentMethods.find(m => m.id === selectedMethod)?.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Botões */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
            //   disabled={selectedMethod === 'DINHEIRO' && amountPaid && parseFloat(amountPaid) < total}
              className="flex-1 bg-success hover:bg-green-700 text-white py-3 px-6 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✅ Confirmar Venda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};