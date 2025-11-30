import { Compra } from '../entities/Compra.js';
import { ItemMercadoria } from '../entities/ItemMercadoria.js';
import { Pagamento } from '../entities/Pagamento.js';
import { Mercadoria } from '../entities/Mercadoria.js';

export const saleController = {
  async getAllSales(req, res) {
    try {
      const sales = await Compra.findAll(req.db, req.user);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSaleById(req, res) {
    try {
      const sale = await Compra.findById(req.db, req.params.id, req.user);
      
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
      const { data, itens, pagamento } = req.body;

      // Validar método de pagamento
      if (!Pagamento.isValidPaymentMethod(pagamento.metodo_pagamento)) {
        return res.status(400).json({ 
          error: 'Método de pagamento inválido'
        });
      }

      // Calcular troco se for dinheiro
      let troco = 0;
      if (pagamento.metodo_pagamento === 'DINHEIRO' && pagamento.valor_pago) {
        troco = Pagamento.calculateChange(pagamento.valor_pago, pagamento.valor);
      }

      // Criar compra com loja e vendedor
      const compra = await Compra.create(trx, {
        data: new Date(data),
        id_loja: req.user.id_loja, // Venda na loja do usuário
        id_vendedor: req.user.id   // Quem realizou a venda
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
      const completeSale = await Compra.findById(req.db, compra.id, req.user);
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
  },
   // src/controllers/saleController.js - MÉTODO REFATORADO

async createQuickSale(req, res) {
    const trx = await req.db.transaction();
    
    try {
      const { itens, metodo_pagamento, valor_pago, observacao } = req.body;
      const currentUser = req.user;

      console.log('🛒 Iniciando venda rápida para usuário:', currentUser.nome);
      console.log('📦 Itens recebidos:', itens);

      // Validar itens
      if (!itens || itens.length === 0) {
        return res.status(400).json({ 
          error: 'É necessário pelo menos um item para registrar a venda.' 
        });
      }

      // Validar método de pagamento
      if (!Pagamento.isValidPaymentMethod(metodo_pagamento)) {
        return res.status(400).json({ 
          error: 'Método de pagamento inválido. Use: DINHEIRO, CARTAO_CREDITO, CARTAO_DEBITO, PIX ou BOLETO'
        });
      }

      // Calcular total da venda e validar produtos
      let totalVenda = 0;
      const itensComDetalhes = [];
      const produtosValidos = [];

      // Validar e calcular cada item
      for (const item of itens) {
        console.log(`🔍 Validando produto ID: ${item.idmercadoria}`);
        
        const produto = await Mercadoria.findById(req.db, item.idmercadoria, currentUser);
        
        if (!produto) {
          await trx.rollback();
          return res.status(404).json({ 
            error: `Produto com ID ${item.idmercadoria} não encontrado` 
          });
        }

        // Verificar se produto pertence à loja do usuário
        if (produto.id_loja !== currentUser.id_loja) {
          await trx.rollback();
          return res.status(403).json({ 
            error: `Produto "${produto.descricao}" não pertence à sua loja` 
          });
        }

        const subtotal = parseFloat(produto.preco) * parseInt(item.quantidade);
        totalVenda += subtotal;

        itensComDetalhes.push({
          ...item,
          descricao: produto.descricao,
          preco_unitario: produto.preco,
          subtotal
        });

        produtosValidos.push(produto);
      }

      console.log(`💰 Total da venda calculado: R$ ${totalVenda.toFixed(2)}`);

      // Validar pagamento para método DINHEIRO
      if (metodo_pagamento === 'DINHEIRO') {
        if (!valor_pago || valor_pago <= 0) {
          await trx.rollback();
          return res.status(400).json({ 
            error: 'Para pagamento em DINHEIRO, o valor pago é obrigatório'
          });
        }
        
        if (parseFloat(valor_pago) < totalVenda) {
          await trx.rollback();
          return res.status(400).json({ 
            error: 'Valor pago insuficiente para o total da venda',
            total_venda: totalVenda.toFixed(2),
            valor_pago: parseFloat(valor_pago).toFixed(2),
            valor_insuficiente: (totalVenda - parseFloat(valor_pago)).toFixed(2)
          });
        }
      }

      // Calcular troco se for dinheiro
      let troco = 0;
      if (metodo_pagamento === 'DINHEIRO' && valor_pago) {
        troco = Pagamento.calculateChange(parseFloat(valor_pago), totalVenda);
        console.log(`🪙 Troco calculado: R$ ${troco.toFixed(2)}`);
      }

      // Criar compra
      console.log('📝 Criando registro de compra...');
      const compraData = {
        data: new Date(),
        id_loja: currentUser.id_loja,
        id_vendedor: currentUser.id
      };

      const compra = await Compra.create(trx, compraData);
      console.log(`✅ Compra criada com ID: ${compra.id}`);

      // Adicionar itens
      console.log('📦 Adicionando itens à compra...');
      const itemsToInsert = itens.map(item => ({
        quantidade: item.quantidade,
        idmercadoria: item.idmercadoria,
        idcompra: compra.id
      }));
      
      await ItemMercadoria.createMultiple(trx, itemsToInsert);
      console.log(`✅ ${itemsToInsert.length} itens adicionados`);

      // 🆕 CORREÇÃO: Preparar dados de pagamento SEM a coluna valor_pago
      const paymentData = {
        data: new Date(),
        valor: totalVenda,
        metodo_pagamento: metodo_pagamento,
        status: 'APROVADO',
        troco: troco,
        observacao: observacao || `Venda rápida - ${metodo_pagamento}`,
        idcompra: compra.id
      };

      // 🆕 CORREÇÃO: Para dinheiro, incluir informação do valor pago na observação
      if (metodo_pagamento === 'DINHEIRO' && valor_pago) {
        paymentData.observacao = `Venda em dinheiro - Valor pago: R$ ${parseFloat(valor_pago).toFixed(2)} - Troco: R$ ${troco.toFixed(2)}${observacao ? ' - ' + observacao : ''}`;
      }

      console.log('💳 Criando registro de pagamento...', paymentData);
      await Pagamento.create(trx, paymentData);
      console.log('✅ Pagamento registrado com sucesso');

      // Commit da transação
      await trx.commit();
      console.log('✅ Transação concluída com sucesso');

      // Buscar dados completos para retornar
      const completeSale = await Compra.findById(req.db, compra.id, currentUser);
      const items = await ItemMercadoria.findBySaleId(req.db, compra.id);
      const payments = await Pagamento.findBySaleId(req.db, compra.id);

      // 🆕 CORREÇÃO: Incluir informações de pagamento no response
      const responseData = {
        message: 'Venda registrada com sucesso!',
        venda: {
          ...completeSale,
          itens: items,
          pagamentos: payments,
          total_venda: totalVenda,
          troco: troco,
          // 🆕 Incluir informações de pagamento para dinheiro
          ...(metodo_pagamento === 'DINHEIRO' && {
            valor_pago: parseFloat(valor_pago),
            metodo_pagamento: metodo_pagamento
          })
        }
      };

      res.status(201).json(responseData);
      
    } catch (error) {
      await trx.rollback();
      console.error('❌ Erro ao registrar venda rápida:', error);
      
      // 🆕 CORREÇÃO: Mensagem de erro mais amigável
      let errorMessage = error.message;
      
      if (error.message.includes('valor_pago') && error.message.includes('does not exist')) {
        errorMessage = 'Erro de configuração do banco de dados: coluna "valor_pago" não existe na tabela pagamento. Use a observação para registrar valores em dinheiro.';
      }
      
      res.status(500).json({ 
        error: 'Erro ao registrar venda',
        details: errorMessage
      });
    }
  },

  async getMySales(req, res) {
    try {
      const currentUser = req.user;
      const { data_inicio, data_fim, limit = 50 } = req.query;

      let query = req.db('compra as c')
        .leftJoin('loja', 'c.id_loja', 'loja.id')
        .leftJoin('usuario as vendedor', 'c.id_vendedor', 'vendedor.id')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .select(
          'c.*', 
          'loja.nome as loja_nome',
          'vendedor.nome as vendedor_nome',
          'p.valor as total_venda',
          'p.metodo_pagamento',
          'p.status as status_pagamento'
        )
        .where('c.id_vendedor', currentUser.id)
        .orderBy('c.data', 'desc')
        .limit(parseInt(limit));

      // Filtro por período
      if (data_inicio) {
        query = query.where('c.data', '>=', data_inicio);
      }
      if (data_fim) {
        query = query.where('c.data', '<=', data_fim);
      }

      const sales = await query;

      // Buscar itens para cada venda
      const salesWithItems = await Promise.all(
        sales.map(async (sale) => {
          const items = await ItemMercadoria.findBySaleId(req.db, sale.id);
          return {
            ...sale,
            itens: items
          };
        })
      );

      res.json(salesWithItems);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 BUSCAR VENDA ESPECÍFICA DO VENDEDOR
  async getMySaleById(req, res) {
    try {
      const currentUser = req.user;
      const { id } = req.params;

      const sale = await req.db('compra as c')
        .leftJoin('loja', 'c.id_loja', 'loja.id')
        .leftJoin('usuario as vendedor', 'c.id_vendedor', 'vendedor.id')
        .select(
          'c.*', 
          'loja.nome as loja_nome',
          'vendedor.nome as vendedor_nome'
        )
        .where('c.id', id)
        .where('c.id_vendedor', currentUser.id) // Apenas suas vendas
        .first();

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada ou acesso negado' });
      }

      const items = await ItemMercadoria.findBySaleId(req.db, id);
      const payments = await Pagamento.findBySaleId(req.db, id);

      res.json({
        ...sale,
        itens: items,
        pagamentos: payments
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ESTATÍSTICAS PESSOAIS DO VENDEDOR
  async getMyStats(req, res) {
    try {
      const currentUser = req.user;
      const { data_inicio, data_fim } = req.query;

      let query = req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_vendedor', currentUser.id)
        .where('p.status', 'APROVADO');

      // Filtro por período
      if (data_inicio) {
        query = query.where('c.data', '>=', data_inicio);
      }
      if (data_fim) {
        query = query.where('c.data', '<=', data_fim);
      }

      const stats = await query
        .select(
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_vendido'),
          req.db.raw('AVG(p.valor) as ticket_medio'),
          req.db.raw('MAX(c.data) as ultima_venda'),
          req.db.raw('COUNT(DISTINCT DATE(c.data)) as dias_trabalhados')
        )
        .first();

      // Métodos de pagamento mais usados
      const paymentMethods = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_vendedor', currentUser.id)
        .where('p.status', 'APROVADO')
        .groupBy('p.metodo_pagamento')
        .select(
          'p.metodo_pagamento',
          req.db.raw('COUNT(*) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_valor')
        )
        .orderBy('total_vendas', 'desc');

      // Vendas por dia (últimos 7 dias)
      const last7Days = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_vendedor', currentUser.id)
        .where('p.status', 'APROVADO')
        .where('c.data', '>=', req.db.raw("CURRENT_DATE - INTERVAL '7 days'"))
        .groupBy(req.db.raw('DATE(c.data)'))
        .select(
          req.db.raw('DATE(c.data) as dia'),
          req.db.raw('COUNT(*) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_dia')
        )
        .orderBy('dia', 'desc');

      res.json({
        estatisticas_gerais: stats,
        metodos_pagamento: paymentMethods,
        ultimos_7_dias: last7Days
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};