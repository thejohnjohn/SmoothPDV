// src/controllers/reportController.js - NOVO ARQUIVO

import { pdfController } from './pdfController.js';
import { emailController } from './emailController.js';

export const reportController = {
  // 🆕 GERAR RELATÓRIO PDF DO VENDEDOR
  async generateSellerReport(req, res) {
    try {
      const currentUser = req.user;
      const { data_inicio, data_fim, tipo_relatorio } = req.body;

      // Buscar dados das vendas do vendedor
      const sales = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .leftJoin('loja', 'c.id_loja', 'loja.id')
        .where('c.id_vendedor', currentUser.id)
        .where('p.status', 'APROVADO')
        .whereBetween('c.data', [data_inicio, data_fim])
        .select(
          'c.*',
          'p.valor as total_venda',
          'p.metodo_pagamento',
          'loja.nome as loja_nome'
        )
        .orderBy('c.data', 'desc');

      // Calcular métricas
      const totalVendas = sales.length;
      const totalFaturado = sales.reduce((sum, sale) => sum + parseFloat(sale.total_venda), 0);
      const ticketMedio = totalVendas > 0 ? totalFaturado / totalVendas : 0;

      // Métodos de pagamento
      const paymentMethods = sales.reduce((acc, sale) => {
        acc[sale.metodo_pagamento] = (acc[sale.metodo_pagamento] || 0) + 1;
        return acc;
      }, {});

      const reportData = {
        title: `Relatório de Vendas - ${currentUser.nome}`,
        reportType: tipo_relatorio || 'vendedor',
        data: {
          periodo: {
            startDate: data_inicio,
            endDate: data_fim
          },
          metrics: {
            total_vendas: totalVendas,
            total_faturado: totalFaturado,
            ticket_medio: ticketMedio
          },
          vendas: sales,
          metodos_pagamento: paymentMethods
        },
        user: currentUser
      };

      // Usar o pdfController existente
      req.body = reportData;
      return pdfController.generateDashboardPDF(req, res);

    } catch (error) {
      console.error('Erro ao gerar relatório do vendedor:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório PDF' });
    }
  },

  // 🆕 ENVIAR RELATÓRIO POR EMAIL (Vendedor)
  async sendSellerReportEmail(req, res) {
    try {
      const currentUser = req.user;
      const { recipientEmail, data_inicio, data_fim, message } = req.body;

      // Buscar dados para o relatório
      const sales = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_vendedor', currentUser.id)
        .where('p.status', 'APROVADO')
        .whereBetween('c.data', [data_inicio, data_fim])
        .select('c.*', 'p.valor as total_venda', 'p.metodo_pagamento');

      // Calcular métricas
      const totalVendas = sales.length;
      const totalFaturado = sales.reduce((sum, sale) => sum + parseFloat(sale.total_venda), 0);

      const dashboardData = {
        periodo: {
          startDate: data_inicio,
          endDate: data_fim
        },
        metrics: {
          total_vendas: totalVendas,
          total_faturado: totalFaturado,
          ticket_medio: totalVendas > 0 ? totalFaturado / totalVendas : 0
        }
      };

      // Usar o emailController existente
      req.body = {
        recipientEmail,
        subject: `Relatório de Vendas - ${currentUser.nome} (${data_inicio} à ${data_fim})`,
        message: message || `Relatório de vendas do período ${data_inicio} à ${data_fim}`,
        dashboardData
      };

      return emailController.sendReportEmail(req, res);

    } catch (error) {
      console.error('Erro ao enviar relatório por email:', error);
      res.status(500).json({ error: 'Erro ao enviar relatório por email' });
    }
  },

  // 🆕 GERAR NOTA FISCAL (Simulação)
  async generateInvoice(req, res) {
    try {
      const currentUser = req.user;
      const { sale_id } = req.body;

      // Buscar venda específica
      const sale = await req.db('compra as c')
        .leftJoin('loja', 'c.id_loja', 'loja.id')
        .leftJoin('usuario as vendedor', 'c.id_vendedor', 'vendedor.id')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id', sale_id)
        .where('c.id_vendedor', currentUser.id) // Apenas suas vendas
        .select(
          'c.*',
          'loja.nome as loja_nome',
          'loja.endereco as loja_endereco',
          'loja.cnpj as loja_cnpj',
          'vendedor.nome as vendedor_nome',
          'p.valor as total_venda',
          'p.metodo_pagamento'
        )
        .first();

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada ou acesso negado' });
      }

      // Buscar itens da venda
      const items = await req.db('item_mercadoria as im')
        .leftJoin('mercadoria as m', 'im.idmercadoria', 'm.id')
        .where('im.idcompra', sale_id)
        .select(
          'im.quantidade',
          'm.descricao',
          'm.preco',
          req.db.raw('(im.quantidade * m.preco) as subtotal')
        );

      // Simular geração de nota fiscal
      const invoiceData = {
        numero_nota: `NF${Date.now()}`,
        data_emissao: new Date().toISOString().split('T')[0],
        venda: sale,
        itens: items,
        total_venda: sale.total_venda
      };

      // Configurar headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="nota-fiscal-${sale_id}.pdf"`);

      // Simular PDF da nota fiscal (em produção, usar biblioteca PDF)
      const pdfContent = `NOTA FISCAL\nNúmero: ${invoiceData.numero_nota}\n...`;
      res.send(Buffer.from(pdfContent));

    } catch (error) {
      console.error('Erro ao gerar nota fiscal:', error);
      res.status(500).json({ error: 'Erro ao gerar nota fiscal' });
    }
  }
};