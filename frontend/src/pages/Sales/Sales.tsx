import React, { useState, useEffect } from 'react';
import { type Sale } from '../../types/sales';
import { saleService } from '../../services/saleService';

export const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Carregando vendas...</div>;

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>Vendas</h1>
        <button className="btn-primary">Nova Venda</button>
      </div>

      <div className="sales-list">
        {sales.map(sale => (
          <div key={sale.id} className="sale-card">
            <div className="sale-header">
              <h3>Venda #{sale.id}</h3>
              <span className="sale-date">{new Date(sale.data).toLocaleDateString()}</span>
            </div>
            <p>Cliente: {sale.cliente_nome || 'Não informado'}</p>
            <p>Itens: {sale.itens?.length || 0}</p>
            <div className="sale-total">
              Total: R$ {sale.pagamentos?.reduce((sum, p) => sum + p.valor, 0).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};