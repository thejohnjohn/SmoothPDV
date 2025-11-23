import PDFDocument from 'pdfkit';
import { formatCurrency, formatDate } from '../utils/formatters.js';

export const pdfController = {
  async generateDashboardPDF(req, res) {
    try {
      const { title, reportType, includeCharts, data, user } = req.body;

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
         .text(title, { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(10)
         .text(`Gerado por: ${user.nome} (${user.tipo})`, { align: 'center' })
         .text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' })
         .text(`Período: ${data.periodo.startDate} à ${data.periodo.endDate}`, { align: 'center' });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Linha divisória

      // ===== MÉTRICAS PRINCIPAIS =====
      doc.moveDown();
      doc.fontSize(16).font('Helvetica-Bold')
         .text('MÉTRICAS PRINCIPAIS');
      
      doc.moveDown(0.5);
      
      // Métricas em formato de tabela
      const metrics = data.metrics;
      const startX = 50;
      let currentY = doc.y;

      // Primeira linha de métricas
      doc.fontSize(10).font('Helvetica-Bold')
         .text('Total de Vendas:', startX, currentY)
         .text(metrics.total_vendas?.toString() || '0', 200, currentY, { width: 100, align: 'right' });
      
      doc.text('Faturamento Total:', 300, currentY)
         .text(formatCurrency(metrics.total_faturado || 0), 450, currentY, { width: 100, align: 'right' });

      currentY += 20;

      // Segunda linha
      doc.text('Clientes Ativos:', startX, currentY)
         .text(metrics.clientes_ativos?.toString() || '0', 200, currentY, { width: 100, align: 'right' });
      
      doc.text('Ticket Médio:', 300, currentY)
         .text(formatCurrency(metrics.ticket_medio || 0), 450, currentY, { width: 100, align: 'right' });

      currentY += 30;
      doc.y = currentY;

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

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório PDF' });
    }
  }
};