import { Compra } from '../entities/Compra.js';
import { ItemMercadoria } from '../entities/ItemMercadoria.js';
import { Pagamento } from '../entities/Pagamento.js';

export const saleController = {
  async getAllSales(req, res) {
    try {
      const sales = await Compra.findAll(req.db);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSaleById(req, res) {
    try {
      const sale = await Compra.findById(req.db, req.params.id);
      
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      const items = await ItemMercadoria.findBySaleId(req.db, req.params.id);
      const payments = await Pagamento.findBySaleId(req.db, req.params.id);

      res.json({
        ...sale,
        itens: items,
        pagamentos: payments
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createSale(req, res) {
    const trx = await req.db.transaction();
    
    try {
      const { data, id_cliente, itens, pagamento } = req.body;

      // Validar método de pagamento
      if (!Pagamento.isValidPaymentMethod(pagamento.metodo_pagamento)) {
        return res.status(400).json({ 
          error: 'Método de pagamento inválido',
          metodos_validos: Object.values(MetodoPagamento)
        });
      }

      // Calcular troco se for dinheiro
      let troco = 0;
      if (pagamento.metodo_pagamento === 'DINHEIRO' && pagamento.valor_pago) {
        troco = Pagamento.calculateChange(pagamento.valor_pago, pagamento.valor);
      }

      // Criar compra
      const compra = await Compra.create(trx, {
        data: new Date(data),
        id_cliente
      });

      // Adicionar itens
      if (itens && itens.length > 0) {
        const itemsToInsert = itens.map(item => ({
          quantidade: item.quantidade,
          idmercadoria: item.idmercadoria,
          idcompra: compra.id
        }));
        
        await ItemMercadoria.createMultiple(trx, itemsToInsert);
      }

      // Adicionar pagamento
      const paymentData = {
        data: new Date(pagamento.data),
        valor: pagamento.valor,
        metodo_pagamento: pagamento.metodo_pagamento,
        status: pagamento.status || 'APROVADO',
        troco: troco,
        observacao: pagamento.observacao,
        idcompra: compra.id
      };

      await Pagamento.create(trx, paymentData);

      await trx.commit();
      
      // Buscar venda completa para retornar
      const completeSale = await Compra.findById(req.db, compra.id);
      const items = await ItemMercadoria.findBySaleId(req.db, compra.id);
      const payments = await Pagamento.findBySaleId(req.db, compra.id);

      res.status(201).json({
        ...completeSale,
        itens: items,
        pagamentos: payments
      });
      
    } catch (error) {
      await trx.rollback();
      console.error('Erro ao criar venda:', error);
      res.status(500).json({ error: error.message });
    }
  }
};