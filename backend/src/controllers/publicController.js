// src/controllers/publicController.js - NOVO ARQUIVO

import { pdfController } from './pdfController.js';

export const publicController = {
  async downloadInvoiceBySaleId(req, res) {
    try {
      const { saleId } = req.params;
      
      console.log('📱 Download de nota fiscal via QRCode para venda:', saleId);

      // 🆕 Validar saleId
      if (!saleId || isNaN(parseInt(saleId))) {
        return res.status(400).json({ 
          error: 'ID da venda inválido' 
        });
      }

      const saleIdInt = parseInt(saleId);

      // 🆕 Buscar venda no banco (público - sem autenticação)
      const sale = await req.db('compra as c')
        .leftJoin('loja', 'c.id_loja', 'loja.id')
        .leftJoin('usuario as vendedor', 'c.id_vendedor', 'vendedor.id')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id', saleIdInt)
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
        console.log('❌ Venda não encontrada:', saleIdInt);
        return res.status(404).json({ 
          error: 'Nota fiscal não encontrada' 
        });
      }

      console.log('✅ Venda encontrada:', sale.id);

      // 🆕 Buscar itens da venda
      const items = await req.db('item_mercadoria as im')
        .leftJoin('mercadoria as m', 'im.idmercadoria', 'm.id')
        .where('im.idcompra', saleIdInt)
        .select(
          'im.quantidade',
          'm.descricao',
          'm.preco',
          req.db.raw('(im.quantidade * m.preco) as subtotal')
        );

      console.log(`✅ ${items.length} itens encontrados`);

      // 🆕 Usar o pdfController para gerar a nota fiscal
      // Criar objeto user mínimo para o PDF
      const minimalUser = {
        nome: 'Cliente',
        tipo: 'CLIENTE',
        id: 0
      };

      // 🆕 Preparar request para o pdfController
      const pdfRequest = {
        body: {
          sale: sale,
          items: items,
          user: minimalUser
        },
        user: minimalUser
      };

      // 🆕 Usar o método generateInvoicePDF do pdfController
      return pdfController.generateInvoicePDF(pdfRequest, res);

    } catch (error) {
      console.error('❌ Erro ao gerar nota fiscal pública:', error);
      
      // 🆕 Resposta de erro amigável
      res.status(500).json({ 
        error: 'Erro ao gerar nota fiscal',
        message: 'Não foi possível gerar a nota fiscal. Tente novamente mais tarde.'
      });
    }
  },

  // 🆕 Método alternativo: Gerar página HTML simples para visualização
  async viewInvoiceHTML(req, res) {
    try {
      const { saleId } = req.params;

      // Buscar dados da venda (mesma lógica do método anterior)
      const sale = await req.db('compra as c')
        .leftJoin('loja', 'c.id_loja', 'loja.id')
        .leftJoin('usuario as vendedor', 'c.id_vendedor', 'vendedor.id')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id', parseInt(saleId))
        .select(
          'c.*',
          'loja.nome as loja_nome',
          'loja.endereco as loja_endereco',
          'loja.cnpj as loja_cnpj',
          'vendedor.nome as vendedor_nome',
          'p.valor as total_venda',
          'p.metodo_pagamento',
          'p.troco'
        )
        .first();

      if (!sale) {
        return res.status(404).send(`
          <html>
            <head><title>Nota Fiscal Não Encontrada</title></head>
            <body>
              <h1>Nota Fiscal Não Encontrada</h1>
              <p>A venda #${saleId} não foi encontrada no sistema.</p>
            </body>
          </html>
        `);
      }

      // Buscar itens
      const items = await req.db('item_mercadoria as im')
        .leftJoin('mercadoria as m', 'im.idmercadoria', 'm.id')
        .where('im.idcompra', parseInt(saleId))
        .select(
          'im.quantidade',
          'm.descricao',
          'm.preco',
          req.db.raw('(im.quantidade * m.preco) as subtotal')
        );

      // Gerar HTML da nota fiscal
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Nota Fiscal #${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .store-info, .sale-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            .download-btn { 
              display: inline-block; 
              background: #007bff; 
              color: white; 
              padding: 10px 20px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin-top: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <h1>NOTA FISCAL</h1>
              <p>Número: NF${sale.id}${Date.now().toString().slice(-6)}</p>
              <p>Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="store-info">
              <h3>DADOS DO EMITENTE</h3>
              <p><strong>${sale.loja_nome || 'Loja'}</strong></p>
              <p>Endereço: ${sale.loja_endereco || 'Não informado'}</p>
              <p>CNPJ: ${sale.loja_cnpj || 'Não informado'}</p>
            </div>

            <div class="sale-info">
              <h3>DADOS DA VENDA</h3>
              <p>Data: ${new Date(sale.data).toLocaleDateString('pt-BR')}</p>
              <p>Vendedor: ${sale.vendedor_nome || 'Não informado'}</p>
              <p>Método de Pagamento: ${sale.metodo_pagamento || 'Não informado'}</p>
              ${sale.troco > 0 ? `<p>Troco: R$ ${sale.troco.toFixed(2)}</p>` : ''}
            </div>

            <h3>ITENS DA VENDA</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Preço Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.descricao || 'Produto'}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${parseFloat(item.preco || 0).toFixed(2)}</td>
                    <td>R$ ${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total">
              <p>TOTAL DA VENDA: R$ ${parseFloat(sale.total_venda || 0).toFixed(2)}</p>
            </div>

            <div class="footer">
              <p>Smooth PDV - Sistema de Gestão Comercial</p>
              <p>Documento gerado automaticamente</p>
              <a href="/api/download/invoice/${saleId}" class="download-btn">
                📥 Baixar Nota Fiscal (PDF)
              </a>
              <p style="margin-top: 20px;">
                <small>Esta nota fiscal pode ser verificada através do QR Code</small>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);

    } catch (error) {
      console.error('❌ Erro ao gerar HTML da nota fiscal:', error);
      res.status(500).send(`
        <html>
          <body>
            <h1>Erro ao carregar nota fiscal</h1>
            <p>Ocorreu um erro ao gerar a visualização da nota fiscal.</p>
          </body>
        </html>
      `);
    }
  }
};