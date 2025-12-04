// src/controllers/downloadController.js - NOVO ARQUIVO

import { pdfController } from './pdfController.js';

export const downloadController = {
  async downloadInvoiceByQRCode(req, res) {
    try {
      const currentUser = req.user;
      const { saleId } = req.params;
      
      console.log('📱 Download de nota fiscal via QR Code');
      console.log('👤 Usuário:', currentUser.nome, `(${currentUser.tipo})`);
      console.log('🛒 ID da Venda:', saleId);

      // Buscar venda específica
      const sale = await req.db('compra as c')
        .leftJoin('loja', 'c.id_loja', 'loja.id')
        .leftJoin('usuario as vendedor', 'c.id_vendedor', 'vendedor.id')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id', saleId)
        .select(
          'c.*',
          'loja.nome as loja_nome',
          'loja.endereco as loja_endereco',
          'loja.telefone as loja_telefone',
          'loja.cnpj as loja_cnpj',
          'loja.email as loja_email',
          'vendedor.nome as vendedor_nome',
          'p.valor as total_venda',
          'p.metodo_pagamento',
          'p.data as data_pagamento',
          'p.troco'
        )
        .first();

      if (!sale) {
        console.log('❌ Venda não encontrada');
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      console.log('✅ Venda encontrada:', sale.id);

      // 🆕 VALIDAÇÃO DE ACESSO: 
      // - Vendedor só pode baixar suas próprias vendas
      // - Gerente pode baixar vendas da sua loja
      // - Admin pode baixar todas as vendas
      
      if (currentUser.tipo === 'VENDEDOR') {
        if (sale.id_vendedor !== currentUser.id) {
          console.log('❌ Vendedor tentando acessar venda de outro vendedor');
          return res.status(403).json({ 
            error: 'Você só pode baixar notas fiscais das suas próprias vendas.' 
          });
        }
      }
      
      if (currentUser.tipo === 'GERENTE') {
        if (sale.id_loja !== currentUser.id_loja) {
          console.log('❌ Gerente tentando acessar venda de outra loja');
          return res.status(403).json({ 
            error: 'Você só pode baixar notas fiscais da sua loja.' 
          });
        }
      }

      // Buscar itens da venda
      const items = await req.db('item_mercadoria as im')
        .leftJoin('mercadoria as m', 'im.idmercadoria', 'm.id')
        .where('im.idcompra', saleId)
        .select(
          'im.quantidade',
          'm.descricao',
          'm.preco',
          req.db.raw('(im.quantidade * m.preco) as subtotal')
        );

      console.log(`✅ ${items.length} itens encontrados para a venda`);

      // 🆕 ADICIONAR INFORMAÇÕES DO QR CODE À NOTA FISCAL
      const qrCodeInfo = {
        saleId: sale.id,
        date: new Date().toISOString(),
        total: sale.total_venda,
        store: sale.loja_nome,
        qrCodeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/download/invoice/${sale.id}`
      };

      // Preparar dados para o PDF Controller
      const invoiceData = {
        sale: {
          ...sale,
          qrCodeInfo: qrCodeInfo  // 🆕 Adicionar info do QR Code
        },
        items: items,
        user: currentUser
      };

      // 🆕 GERAR PDF COM QR CODE VISÍVEL
      return this.generateInvoiceWithQRCode(res, invoiceData);

    } catch (error) {
      console.error('❌ Erro ao baixar nota fiscal via QR Code:', error);
      res.status(500).json({ 
        error: 'Erro ao baixar nota fiscal',
        details: error.message 
      });
    }
  },

  // 🆕 MÉTODO: Gerar PDF com QR Code visível
  async generateInvoiceWithQRCode(res, invoiceData) {
    try {
      const { sale, items, user } = invoiceData;

      // Importar biblioteca para QR Code (se necessário)
      // Nota: Para QR Code real, você precisaria de uma biblioteca como 'qr-image' ou 'qrcode'
      // Por enquanto, vamos simular com texto
      
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });

      // Configurar headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="nota-fiscal-${sale.id}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      doc.pipe(res);

      // ===== CABEÇALHO DA NOTA FISCAL =====
      doc.fontSize(18).font('Helvetica-Bold')
         .text('NOTA FISCAL ELETRÔNICA', { align: 'center' });
      
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica')
         .text(`Nº: NF${sale.id}${Date.now().toString().slice(-6)}`, { align: 'center' })
         .text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, { align: 'center' });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // ===== QR CODE SIMULADO =====
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold')
         .text('CÓDIGO QR PARA VALIDAÇÃO:', { align: 'center' });
      
      doc.moveDown(0.3);
      doc.fontSize(8).font('Helvetica')
         .text(`Venda ID: ${sale.id}`, { align: 'center' })
         .text(`Loja: ${sale.loja_nome}`, { align: 'center' })
         .text(`Valor: R$ ${parseFloat(sale.total_venda || 0).toFixed(2)}`, { align: 'center' })
         .text(`Data: ${new Date(sale.data).toLocaleDateString('pt-BR')}`, { align: 'center' });

      // 🆕 ÁREA DO QR CODE (simulada com texto e borda)
      const qrX = 200;
      const qrY = doc.y + 10;
      const qrSize = 150;
      
      // Desenhar borda do QR Code
      doc.rect(qrX, qrY, qrSize, qrSize).stroke();
      
      // Texto dentro do QR Code (simulação)
      doc.fontSize(8).font('Helvetica')
         .text('QR Code', qrX + 50, qrY + 60, { align: 'center', width: qrSize });
      doc.text('(Simulado)', qrX + 50, qrY + 80, { align: 'center', width: qrSize });
      doc.text(`ID: ${sale.id}`, qrX + 50, qrY + 100, { align: 'center', width: qrSize });

      doc.y = qrY + qrSize + 20;
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
         .text(`Hora: ${new Date(sale.data).toLocaleTimeString('pt-BR')}`, 50, doc.y + 15)
         .text(`Vendedor: ${sale.vendedor_nome || 'Não informado'}`, 50, doc.y + 30)
         .text(`Método de Pagamento: ${sale.metodo_pagamento || 'Não informado'}`, 50, doc.y + 45);

      if (sale.troco > 0) {
        doc.text(`Troco: R$ ${sale.troco.toFixed(2)}`, 50, doc.y + 60);
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

      // ===== RODAPÉ COM INFORMAÇÕES DO QR CODE =====
      const pageHeight = doc.page.height;
      doc.y = pageHeight - 120;
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      doc.fontSize(8).font('Helvetica')
         .text('Smooth PDV - Sistema de Gestão Comercial', { align: 'center' })
         .text('Nota Fiscal gerada automaticamente - Documento não fiscal', { align: 'center' })
         .text(`Emitente: ${user.nome} (${user.tipo})`, { align: 'center' })
         .text(`QR Code para validação: ${sale.qrCodeInfo?.qrCodeUrl || 'N/A'}`, { align: 'center' })
         .text(`Página ${doc.bufferedPageRange().count} de ${doc.bufferedPageRange().count}`, { align: 'center' });

      doc.end();

      console.log('✅ Nota fiscal com QR Code gerada com sucesso');

    } catch (error) {
      console.error('❌ Erro ao gerar PDF com QR Code:', error);
      throw error;
    }
  },

  // 🆕 MÉTODO: Gerar link do QR Code (para usar no frontend)
  async generateQRCodeLink(req, res) {
    try {
      const currentUser = req.user;
      const { saleId } = req.params;

      // Validar acesso à venda
      const sale = await req.db('compra')
        .where('id', saleId)
        .first();

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      // Validar permissões
      if (currentUser.tipo === 'VENDEDOR' && sale.id_vendedor !== currentUser.id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (currentUser.tipo === 'GERENTE' && sale.id_loja !== currentUser.id_loja) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Gerar link do QR Code
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const qrCodeUrl = `${baseUrl}/api/download/invoice/${saleId}`;
      
      // 🆕 Em produção, você pode gerar uma imagem QR Code real aqui
      // const qrCodeImage = await generateQRCodeImage(qrCodeUrl);

      res.json({
        success: true,
        qrCodeUrl: qrCodeUrl,
        saleId: saleId,
        downloadUrl: qrCodeUrl,
        message: 'Use este link/QR Code para baixar a nota fiscal'
      });

    } catch (error) {
      console.error('❌ Erro ao gerar link do QR Code:', error);
      res.status(500).json({ error: 'Erro ao gerar QR Code' });
    }
  }
};