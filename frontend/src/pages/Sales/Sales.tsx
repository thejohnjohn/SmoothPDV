import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, Landmark, Plus, Smartphone } from 'lucide-react';
import type { Sale } from '../../types/sales';
import { saleService } from '../../services/saleService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState/LoadingState';
import { Modal } from '../../components/ui/Modal/Modal';
import { PageHeader } from '../../components/ui/PageHeader/PageHeader';

export const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await saleService.getAll();
      setSales(data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSaleTotal = (sale: Sale) => {
    return sale.pagamentos?.reduce((sum, p) => sum + p.valor, 0) || 0;
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Vendas"
        subtitle={`${sales.length} vendas realizadas`}
        actions={
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova Venda
          </Button>
        }
      />

      {/* Grid de Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sales.map(sale => (
          <Card
            key={sale.id}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => setSelectedSale(sale)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-ink text-lg">
                  Venda #{sale.id}
                </h3>
                <p className="text-ink-muted text-sm mt-1">
                  {formatDate(sale.data)}
                </p>
              </div>
              <Badge tone={getSaleTotal(sale) > 1000 ? 'success' : 'info'}>
                {formatCurrency(getSaleTotal(sale))}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Cliente:</span>
                <span className="font-medium">
                  {sale.cliente_nome || 'Não informado'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-muted">Itens:</span>
                <span className="font-medium">
                  {sale.itens?.length || 0} produtos
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-muted">Pagamento:</span>
                <span className="flex items-center gap-1.5 font-medium">
                  {getPaymentMethodIcon(sale.pagamentos?.[0]?.metodo_pagamento || 'DINHEIRO')}
                  {sale.pagamentos?.[0]?.metodo_pagamento || 'DINHEIRO'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-line">
              <Button variant="outline" size="sm" className="flex-1">
                Detalhes
              </Button>
              <Button variant="success" size="sm" className="flex-1">
                Reimpressão
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {sales.length === 0 && (
        <EmptyState
          icon={<Banknote className="h-8 w-8" aria-hidden="true" />}
          title="Nenhuma venda encontrada"
          description="Realize a primeira venda no PDV"
        />
      )}

      {/* Modal de Detalhes */}
      {selectedSale && (
        <Modal
          open
          onClose={() => setSelectedSale(null)}
          title={`Detalhes da Venda #${selectedSale.id}`}
          size="md"
        >
          {/* Conteúdo do modal de detalhes*/}
          <p>{selectedSale.id}</p>
        </Modal>
      )}
    </div>
  );
};

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'DINHEIRO':
      return <Banknote className="h-4 w-4" aria-hidden="true" />;
    case 'CARTAO_DEBITO':
    case 'CARTAO_CREDITO':
      return <CreditCard className="h-4 w-4" aria-hidden="true" />;
    case 'PIX':
      return <Smartphone className="h-4 w-4" aria-hidden="true" />;
    case 'BOLETO':
      return <Landmark className="h-4 w-4" aria-hidden="true" />;
    default:
      return null;
  }
};
