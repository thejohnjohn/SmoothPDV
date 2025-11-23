import React, { useState, useEffect } from 'react';
import type { Sale } from '../../types/sales';
import { saleService } from '../../services/saleService';
import { formatCurrency, formatDate } from '../../utils/formatters';

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Vendas</h1>
          <p className="text-gray-600 mt-1">
            {sales.length} vendas realizadas
          </p>
        </div>
        
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
          + Nova Venda
        </button>
      </div>

      {/* Grid de Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sales.map(sale => (
          <div 
            key={sale.id} 
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
            onClick={() => setSelectedSale(sale)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  Venda #{sale.id}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {formatDate(sale.data)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                getSaleTotal(sale) > 1000 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {formatCurrency(getSaleTotal(sale))}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium">
                  {sale.cliente_nome || 'Não informado'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Itens:</span>
                <span className="font-medium">
                  {sale.itens?.length || 0} produtos
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Pagamento:</span>
                <span className="font-medium">
                  {sale.pagamentos?.[0]?.metodo_pagamento || 'DINHEIRO'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                Detalhes
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                Reimpressão
              </button>
            </div>
          </div>
        ))}
      </div>

      {sales.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">💰</div>
          <p className="text-gray-500 text-lg">Nenhuma venda encontrada</p>
          <p className="text-gray-400 mt-1">
            Realize a primeira venda no PDV
          </p>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalhes da Venda #{selectedSale.id}
                </h2>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Conteúdo do modal de detalhes */}
              <p>Detalhes da venda aqui...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};