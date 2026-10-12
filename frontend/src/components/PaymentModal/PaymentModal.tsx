import React, { useState } from 'react';
import { Banknote, CheckCircle2, CreditCard, Landmark, Smartphone } from 'lucide-react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';

export interface PaymentData {
  metodo_pagamento: string;
  valor_pago?: number;
  troco?: number;
  observacao?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: PaymentData) => void;
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
    { id: 'DINHEIRO', name: 'Dinheiro', description: 'Pagamento em espécie', icon: Banknote },
    { id: 'CARTAO_DEBITO', name: 'Cartão Débito', description: 'Cartão de débito', icon: CreditCard },
    { id: 'CARTAO_CREDITO', name: 'Cartão Crédito', description: 'Cartão de crédito', icon: CreditCard },
    { id: 'PIX', name: 'Pix', description: 'Transferência instantânea', icon: Smartphone },
    { id: 'BOLETO', name: 'Boleto', description: 'Pagamento via boleto', icon: Landmark },
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
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Finalizar Pagamento"
      size="sm"
      footer={
        <>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="success"
            className="flex-1"
            onClick={handleConfirm}
            //   disabled={selectedMethod === 'DINHEIRO' && amountPaid && parseFloat(amountPaid) < total}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Confirmar Venda
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <p className="text-lg font-bold text-success-600 tabular-nums">
          Total: R$ {total.toFixed(2)}
        </p>

        {/* Métodos de Pagamento */}
        <div>
          <h3 className="font-medium text-ink mb-3">Selecione a forma de pagamento:</h3>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="flex items-center gap-2 font-medium text-ink">
                      <method.icon className="h-4 w-4" aria-hidden="true" />
                      {method.name}
                    </p>
                    <p className="text-sm text-ink-muted">{method.description}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-surface rounded-full"></div>
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
            <label className="block text-sm font-semibold text-ink mb-2">
              Valor Recebido:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-muted">
                R$
              </span>
              <Input
                type="number"
                step="0.01"
                min={total}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={total.toFixed(2)}
                className="pl-10"
              />
            </div>
            {change > 0 && (
              <p className="mt-2 text-lg font-bold text-success-600 tabular-nums">
                Troco: R$ {change.toFixed(2)}
              </p>
            )}
            {amountPaid && parseFloat(amountPaid) < total && (
              <p className="mt-2 text-error-600 text-sm tabular-nums">
                Valor insuficiente. Faltam: R$ {(total - parseFloat(amountPaid)).toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Observação */}
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            Observação (opcional):
          </label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Ex: Cliente preferencial, desconto especial..."
            rows={3}
            className="w-full px-4 py-3 border border-line bg-surface text-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {/* Resumo do Pagamento */}
        <div className="bg-surface-muted rounded-lg p-4">
          <h4 className="font-medium text-ink mb-2">Resumo do Pagamento:</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total da Venda:</span>
              <span className="font-medium tabular-nums">R$ {total.toFixed(2)}</span>
            </div>
            {selectedMethod === 'DINHEIRO' && amountPaid && (
              <>
                <div className="flex justify-between">
                  <span>Valor Pago:</span>
                  <span className="font-medium tabular-nums">R$ {parseFloat(amountPaid).toFixed(2)}</span>
                </div>
                {change > 0 && (
                  <div className="flex justify-between text-success-600">
                    <span>Troco:</span>
                    <span className="font-bold tabular-nums">R$ {change.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between pt-2 border-t border-line">
              <span>Forma de Pagamento:</span>
              <span className="font-medium">
                {paymentMethods.find(m => m.id === selectedMethod)?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
