import PDFDocument from 'pdfkit';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export const pdfController = {
  async generateDashboardPDF(req, res) {
    try {
      console.log('📊 Iniciando geração de PDF do dashboard...');
      
      // 🆕 CORREÇÃO: Obter dados de múltiplas fontes possíveis
      let { title, reportType, includeCharts, data, user } = req.body;
      
      // 🆕 CORREÇÃO: Se body estiver vazio, tentar obter dados do query ou user da requisição
      if (!user && req.user) {
        user = req.user;
        console.log('✅ Usando usuário da requisição:', user.nome);
      }
      
      if (!data && req.query) {
        data = {
          periodo: {
            startDate: req.query.data_inicio || new Date().toISOString().split('T')[0],
            endDate: req.query.data_fim || new Date().toISOString().split('T')[0]
          },
          metrics: JSON.parse(req.query.metrics || '{}')
        };
        console.log('✅ Usando dados da query string');
      }

      // 🆕 CORREÇÃO: Validações essenciais
      if (!user) {
        console.error('❌ Usuário não definido na requisição');
        return res.status(400).json({ 
          error: 'Usuário não autenticado ou dados insuficientes' 
        });
      }

      if (!data) {
        console.error('❌ Dados não fornecidos para o relatório');
        return res.status(400).json({ 
          error: 'Dados do relatório são obrigatórios' 
        });
      }

      console.log('👤 Usuário:', user.nome);
      console.log('📋 Tipo de relatório:', reportType);
      console.log('📅 Período:', data.periodo?.startDate, 'à', data.periodo?.endDate);

      // 🆕 CORREÇÃO: Valores padrão para dados opcionais
      const finalTitle = title || `Relatório ${user.tipo} - Smooth PDV`;
      const finalReportType = reportType || 'dashboard';
      const metrics = data.metrics || {};
      const periodo = data.periodo || { 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: new Date().toISOString().split('T')[0] 
      };

      // Criar documento PDF
      const doc = new PDFDocument({ margin: 50 });
      
      // Configurar headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-${Date.now()}.pdf"`);

      doc.pipe(res);

      // ===== CABEÇALHO =====
      doc.fontSize(20).font('Helvetica-Bold')
         .text('SMOOTH PDV - RELATÓRIO', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica')
         .text(finalTitle, { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(10)
         .text(`Gerado por: ${user.nome} (${user.tipo})`, { align: 'center' })
         .text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' })
         .text(`Período: ${periodo.startDate} à ${periodo.endDate}`, { align: 'center' });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Linha divisória

      // ===== MÉTRICAS PRINCIPAIS =====
      doc.moveDown();
      doc.fontSize(16).font('Helvetica-Bold')
         .text('MÉTRICAS PRINCIPAIS');
      
      doc.moveDown(0.5);
      
      // Métricas em formato de tabela
      const startX = 50;
      let currentY = doc.y;

      // 🆕 CORREÇÃO: Métricas com fallbacks
      // Primeira linha de métricas
      doc.fontSize(10).font('Helvetica-Bold')
         .text('Total de Vendas:', startX, currentY)
         .text(metrics.total_vendas?.toString() || '0', 200, currentY, { width: 100, align: 'right' });
      
      doc.text('Faturamento Total:', 300, currentY)
         .text(formatCurrency(metrics.total_faturado || 0), 450, currentY, { width: 100, align: 'right' });

      currentY += 20;

      // Segunda linha
      doc.text('Vendedores Ativos:', startX, currentY)
         .text(metrics.vendedores_ativos?.toString() || metrics.total_vendedores?.toString() || '0', 200, currentY, { width: 100, align: 'right' });
      
      doc.text('Ticket Médio:', 300, currentY)
         .text(formatCurrency(metrics.ticket_medio || 0), 450, currentY, { width: 100, align: 'right' });

      currentY += 30;
      doc.y = currentY;

      // 🆕 CORREÇÃO: Se não há dados específicos, mostrar mensagem
      if (!data.salesBySeller && !data.performanceVendedores) {
        doc.fontSize(12).font('Helvetica')
           .text('Não há dados adicionais para exibir neste relatório.', { align: 'center' });
        doc.moveDown();
        doc.text('Os dados do dashboard serão exibidos aqui quando disponíveis.', { align: 'center' });
      }

      // ===== DADOS ESPECÍFICOS POR TIPO DE USUÁRIO =====
      if (user.tipo === 'ADMIN' && data.salesBySeller) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold')
           .text('TOP VENDEDORES');
        
        doc.moveDown(0.5);
        
        data.salesBySeller.forEach((vendedor, index) => {
          doc.fontSize(10).font('Helvetica')
             .text(`${index + 1}. ${vendedor.vendedor}`, 50, doc.y)
             .text(`${vendedor.total_vendas} vendas`, 400, doc.y, { width: 100, align: 'right' });
          doc.moveDown();
        });
      }

      if (user.tipo === 'GERENTE' && data.performanceVendedores) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold')
           .text('PERFORMANCE DA EQUIPE');
        
        doc.moveDown(0.5);
        
        data.performanceVendedores.forEach((vendedor, index) => {
          doc.fontSize(10).font('Helvetica')
             .text(`${vendedor.vendedor}`, 50, doc.y)
             .text(`${vendedor.total_vendas} vendas`, 300, doc.y, { width: 80, align: 'right' })
             .text(formatCurrency(vendedor.total_vendido || 0), 400, doc.y, { width: 100, align: 'right' });
          doc.moveDown();
        });
      }

      // ===== RODAPÉ =====
      const pageHeight = doc.page.height;
      doc.y = pageHeight - 100;
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      doc.fontSize(8).font('Helvetica')
         .text('Smooth PDV - Sistema de Gestão Comercial', { align: 'center' })
         .text('Relatório gerado automaticamente - Não assinado', { align: 'center' })
         .text(`Página ${doc.bufferedPageRange().count} de ${doc.bufferedPageRange().count}`, { align: 'center' });

      doc.end();

      console.log('✅ PDF gerado com sucesso para:', user.nome);

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      res.status(500).json({ 
        error: 'Erro ao gerar relatório PDF',
        details: error.message 
      });
    }
  },

  // 🆕 CORREÇÃO: Método público para nota fiscal com interface correta
  async generateInvoicePDF(req, res) {
    try {
      const { sale, items, user } = req.body;

      console.log('🧾 Iniciando geração de nota fiscal PDF');

      // 🆕 CORREÇÃO: Validações
      if (!sale || !items) {
        return res.status(400).json({ 
          error: 'Dados da venda e itens são obrigatórios' 
        });
      }

      // Usar método privado
      return this._generateInvoicePDF(res, sale, items, user);

    } catch (error) {
      console.error('❌ Erro ao gerar nota fiscal:', error);
      res.status(500).json({ 
        error: 'Erro ao gerar nota fiscal PDF',
        details: error.message 
      });
    }
  },

  // 🆕 CORREÇÃO: Método privado para lógica de geração
  async _generateInvoicePDF(res, sale, items, user) {
    try {
      // Criar documento PDF
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });

      // Configurar headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="nota-fiscal-${sale.id}.pdf"`);

      doc.pipe(res);

      // ===== CABEÇALHO DA NOTA FISCAL =====
      doc.fontSize(16).font('Helvetica-Bold')
         .text('NOTA FISCAL', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica')
         .text(`Número: NF${sale.id}${Date.now().toString().slice(-6)}`, { align: 'center' })
         .text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // ===== DADOS DA LOJA =====
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold')
         .text('DADOS DO EMITENTE');
      
      doc.fontSize(10).font('Helvetica')
         .text(sale.loja_nome || 'Loja não informada', 50, doc.y)
         .text(`Endereço: ${sale.loja_endereco || 'Não informado'}`, 50, doc.y + 15)
         .text(`CNPJ: ${sale.loja_cnpj || 'Não informado'}`, 50, doc.y + 30)
         .text(`Telefone: ${sale.loja_telefone || 'Não informado'}`, 50, doc.y + 45);

      // ===== DADOS DA VENDA =====
      doc.moveDown(1.5);
      doc.fontSize(12).font('Helvetica-Bold')
         .text('DADOS DA VENDA');
      
      doc.fontSize(10).font('Helvetica')
         .text(`Data da Venda: ${new Date(sale.data).toLocaleDateString('pt-BR')}`, 50, doc.y)
         .text(`Vendedor: ${sale.vendedor_nome || 'Não informado'}`, 50, doc.y + 15)
         .text(`Método de Pagamento: ${sale.metodo_pagamento || 'Não informado'}`, 50, doc.y + 30);

      if (sale.troco > 0) {
        doc.text(`Troco: R$ ${sale.troco.toFixed(2)}`, 50, doc.y + 45);
      }

      // ===== ITENS DA VENDA =====
      doc.moveDown(1.5);
      doc.fontSize(12).font('Helvetica-Bold')
         .text('ITENS DA VENDA');
      
      doc.moveDown(0.5);

      // Cabeçalho da tabela
      const startY = doc.y;
      doc.fontSize(9).font('Helvetica-Bold')
         .text('Descrição', 50, startY)
         .text('Qtd', 300, startY)
         .text('Preço Unit.', 350, startY)
         .text('Subtotal', 450, startY, { width: 100, align: 'right' });

      doc.moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();

      // Itens da venda
      let currentY = startY + 25;
      items.forEach((item, index) => {
        if (currentY > 650) { // Quebra de página se necessário
          doc.addPage();
          currentY = 50;
        }

        doc.fontSize(9).font('Helvetica')
           .text(item.descricao || 'Produto sem descrição', 50, currentY, { width: 240 })
           .text(item.quantidade.toString(), 300, currentY)
           .text(`R$ ${parseFloat(item.preco || 0).toFixed(2)}`, 350, currentY)
           .text(`R$ ${parseFloat(item.subtotal || 0).toFixed(2)}`, 450, currentY, { width: 100, align: 'right' });

        currentY += 20;
      });

      // ===== TOTAL DA VENDA =====
      const totalY = Math.max(currentY + 20, 650);
      doc.moveTo(350, totalY).lineTo(550, totalY).stroke();
      
      doc.fontSize(11).font('Helvetica-Bold')
         .text('TOTAL DA VENDA:', 350, totalY + 10)
         .text(`R$ ${parseFloat(sale.total_venda || 0).toFixed(2)}`, 450, totalY + 10, { width: 100, align: 'right' });

      // ===== RODAPÉ =====
      const pageHeight = doc.page.height;
      doc.y = pageHeight - 100;
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      doc.fontSize(8).font('Helvetica')
         .text('Smooth PDV - Sistema de Gestão Comercial', { align: 'center' })
         .text('Nota Fiscal gerada automaticamente - Documento não fiscal', { align: 'center' })
         .text(`Emitente: ${user.nome} (${user.tipo})`, { align: 'center' })
         .text(`Página ${doc.bufferedPageRange().count} de ${doc.bufferedPageRange().count}`, { align: 'center' });

      doc.end();

      console.log('✅ Nota fiscal PDF gerada com sucesso');

    } catch (error) {
      console.error('❌ Erro ao gerar PDF da nota fiscal:', error);
      throw new Error(`Falha na geração do PDF: ${error.message}`);
    }
  }
};