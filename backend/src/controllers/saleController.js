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

      // Criar compra
      const saleData = {
        data: new Date(data),
        id_cliente
      };
      
      const sale = await Compra.create(trx, saleData);

      // Adicionar itens
      if (itens && itens.length > 0) {
        const itemsToInsert = itens.map(item => ({
          quantidade: item.quantidade,
          idmercadoria: item.idmercadoria,
          idcompra: sale.id
        }));
        
        await ItemMercadoria.createMultiple(trx, itemsToInsert);
      }

      // Adicionar pagamento
      if (pagamento) {
        await Pagamento.create(trx, {
          data: new Date(pagamento.data),
          valor: pagamento.valor,
          idcompra: sale.id
        });
      }

      await trx.commit();
      
      const completeSale = await Compra.findById(req.db, sale.id);
      const items = await ItemMercadoria.findBySaleId(req.db, sale.id);
      const payments = await Pagamento.findBySaleId(req.db, sale.id);

      res.status(201).json({
        ...completeSale,
        itens: items,
        pagamentos: payments
      });
      
    } catch (error) {
      await trx.rollback();
      res.status(500).json({ error: error.message });
    }
  }
};