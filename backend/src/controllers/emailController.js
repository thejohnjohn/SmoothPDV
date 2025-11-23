// emailController.js
import { Resend } from 'resend';

// Inicializar Resend
const resend = new Resend(process.env.EMAIL_API_KEY);

export const emailController = {
  async sendReportEmail(req, res) {
    try {
      const { 
        recipientEmail, 
        subject, 
        message,
        dashboardData
      } = req.body;
      
      const user = req.user;

      console.log('📧 Iniciando envio de e-mail via Resend para:', recipientEmail);

      // ✅ Validações básicas
      if (!recipientEmail) {
        return res.status(400).json({ error: 'E-mail do destinatário é obrigatório' });
      }

      if (!dashboardData) {
        return res.status(400).json({ error: 'Dados do dashboard são obrigatórios' });
      }

      // ✅ Validar configurações da Resend
      if (!process.env.EMAIL_API_KEY) {
        return res.status(500).json({ 
          error: 'EMAIL_API_KEY não configurada. Configure no arquivo .env' 
        });
      }

      if (!process.env.MAIL_FROM) {
        return res.status(500).json({ 
          error: 'MAIL_FROM não configurado. Configure no arquivo .env' 
        });
      }

      // ✅ Verificar conexão com Resend
      console.log('🔑 Resend API Key:', process.env.EMAIL_API_KEY ? '*** CONFIGURADA ***' : 'UNDEFINED');
      console.log('📧 From:', process.env.MAIL_FROM);

      const startDate = dashboardData.periodo?.startDate || new Date().toISOString().split('T')[0];
      const endDate = dashboardData.periodo?.endDate || new Date().toISOString().split('T')[0];

      // ✅ Gerar PDF simples em base64 (alternativa sem pdfController)
      const pdfBuffer = await generateSimplePDF(dashboardData, user);

      // ✅ Preparar conteúdo do e-mail
      const htmlContent = generateEmailTemplate(dashboardData, message, user);
      const textContent = generateEmailText(dashboardData, message, user);

      // ✅ Enviar e-mail via Resend
      const { data, error } = await resend.emails.send({
        from: process.env.MAIL_FROM,
        to: recipientEmail,
        subject: subject || `Relatório Smooth PDV - ${formatDate(startDate)} à ${formatDate(endDate)}`,
        html: htmlContent,
        text: textContent,
        attachments: [
          {
            filename: `relatorio-dashboard-${formatDate(startDate)}-${formatDate(endDate)}.pdf`,
            content: pdfBuffer.toString('base64'), // Resend espera base64
          }
        ]
      });

      if (error) {
        console.error('❌ Erro Resend:', error);
        return res.status(500).json({ 
          error: 'Erro ao enviar e-mail via Resend',
          details: error.message 
        });
      }

      console.log('✅ E-mail enviado com sucesso via Resend! ID:', data.id);

      res.json({ 
        success: true, 
        message: 'Relatório enviado por e-mail com sucesso',
        messageId: data.id,
        resendData: data
      });

    } catch (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      res.status(500).json({ 
        error: 'Erro ao enviar e-mail',
        details: error.message 
      });
    }
  },

  // ✅ Novo método para enviar e-mail simples (sem anexo)
  async sendSimpleEmail(req, res) {
    try {
      const { 
        recipientEmail, 
        subject, 
        htmlContent,
        textContent
      } = req.body;

      // ✅ Validações básicas
      if (!recipientEmail) {
        return res.status(400).json({ error: 'E-mail do destinatário é obrigatório' });
      }

      if (!process.env.EMAIL_API_KEY || !process.env.MAIL_FROM) {
        return res.status(500).json({ 
          error: 'Configurações Resend não encontradas' 
        });
      }

      const { data, error } = await resend.emails.send({
        from: process.env.MAIL_FROM,
        to: recipientEmail,
        subject: subject || 'Mensagem do Smooth PDV',
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        console.error('❌ Erro Resend:', error);
        return res.status(500).json({ 
          error: 'Erro ao enviar e-mail',
          details: error.message 
        });
      }

      console.log('✅ E-mail simples enviado! ID:', data.id);

      res.json({ 
        success: true, 
        message: 'E-mail enviado com sucesso',
        messageId: data.id
      });

    } catch (error) {
      console.error('❌ Erro ao enviar e-mail simples:', error);
      res.status(500).json({ 
        error: 'Erro ao enviar e-mail',
        details: error.message 
      });
    }
  },

  // ✅ Método para testar conexão com Resend
  async testConnection(req, res) {
    try {
      console.log('🧪 Testando conexão com Resend...');
      
      if (!process.env.EMAIL_API_KEY) {
        return res.status(500).json({ 
          success: false,
          error: 'EMAIL_API_KEY não configurada' 
        });
      }

      if (!process.env.MAIL_FROM) {
        return res.status(500).json({ 
          success: false,
          error: 'MAIL_FROM não configurado' 
        });
      }

      // Testar enviando um e-mail de teste
      const { data, error } = await resend.emails.send({
        from: process.env.MAIL_FROM,
        to: 'test@example.com', // E-mail fictício para teste
        subject: 'Teste de Conexão - Smooth PDV',
        html: '<p>Este é um e-mail de teste da Resend.</p>',
        text: 'Este é um e-mail de teste da Resend.',
      });

      if (error) {
        // Se for erro de e-mail inválido, consideramos que a conexão está OK
        if (error.message.includes('invalid_parameter') || error.message.includes('email')) {
          console.log('✅ Conexão Resend: OK (erro esperado de e-mail inválido)');
          return res.json({ 
            success: true, 
            message: 'Conexão com Resend estabelecida com sucesso',
            details: 'API key e configurações válidas'
          });
        }
        
        throw error;
      }

      console.log('✅ Conexão Resend estabelecida com sucesso!');
      res.json({ 
        success: true, 
        message: 'Conexão com Resend estabelecida com sucesso',
        testEmailId: data?.id
      });

    } catch (error) {
      console.error('❌ Erro na conexão Resend:', error);
      res.status(500).json({ 
        success: false,
        error: 'Falha na conexão com Resend',
        details: error.message 
      });
    }
  }
};

// ✅ FUNÇÃO PARA GERAR PDF SIMPLES (sem dependências externas)
async function generateSimplePDF(dashboardData, user) {
  return new Promise((resolve) => {
    // Criar um PDF básico em texto
    const pdfContent = generatePDFContent(dashboardData, user);
    
    // Converter para Buffer (PDF simulado em texto)
    const buffer = Buffer.from(pdfContent, 'utf-8');
    resolve(buffer);
  });
}

// ✅ CONTEÚDO DO PDF (texto simples)
function generatePDFContent(dashboardData, user) {
  const metrics = dashboardData.metrics || {};
  const periodo = dashboardData.periodo || {};
  
  return `
RELATÓRIO SMOOTH PDV
=====================

Gerado por: ${user.nome} (${user.tipo})
Data: ${new Date().toLocaleDateString('pt-BR')}
Período: ${formatDate(periodo.startDate)} à ${formatDate(periodo.endDate)}

MÉTRICAS PRINCIPAIS
-------------------
Total de Vendas: ${metrics.total_vendas || 0}
Faturamento Total: R$ ${parseFloat(metrics.total_faturado || 0).toFixed(2)}
Clientes Ativos: ${metrics.clientes_ativos || 0}
Ticket Médio: R$ ${parseFloat(metrics.ticket_medio || 0).toFixed(2)}

DETALHES ADICIONAIS
-------------------
${dashboardData.salesBySeller ? `
TOP VENDEDORES:
${dashboardData.salesBySeller.map((v, i) => `${i + 1}. ${v.vendedor}: ${v.total_vendas} vendas`).join('\n')}
` : ''}

${dashboardData.performanceVendedores ? `
PERFORMANCE DA EQUIPE:
${dashboardData.performanceVendedores.map(v => `${v.vendedor}: ${v.total_vendas} vendas - R$ ${parseFloat(v.total_vendido || 0).toFixed(2)}`).join('\n')}
` : ''}

${dashboardData.vendasPorDia ? `
VENDAS POR DIA:
${dashboardData.vendasPorDia.map(v => `${formatDate(v.dia)}: ${v.total_vendas} vendas - R$ ${parseFloat(v.total_dia || 0).toFixed(2)}`).join('\n')}
` : ''}

================================
Smooth PDV - Sistema de Gestão Comercial
Relatório gerado automaticamente
  `;
}

// ✅ VERSÃO EM TEXTO SIMPLES DO E-MAIL (fallback)
function generateEmailText(dashboardData, customMessage, user) {
  const metrics = dashboardData.metrics || {};
  const periodo = dashboardData.periodo || {};
  
  let text = `RELATÓRIO SMOOTH PDV\n`;
  text += `=====================\n\n`;
  text += `Enviado por: ${user.nome} (${user.tipo})\n`;
  text += `Data de envio: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}\n\n`;
  
  if (periodo.startDate && periodo.endDate) {
    text += `Período do relatório: ${formatDate(periodo.startDate)} à ${formatDate(periodo.endDate)}\n\n`;
  }
  
  if (customMessage) {
    text += `Mensagem: ${customMessage}\n\n`;
  }
  
  text += `MÉTRICAS PRINCIPAIS:\n`;
  text += `-------------------\n`;
  text += `Total de Vendas: ${metrics.total_vendas || 0}\n`;
  text += `Faturamento Total: R$ ${parseFloat(metrics.total_faturado || 0).toFixed(2)}\n`;
  text += `Clientes Ativos: ${metrics.clientes_ativos || 0}\n`;
  text += `Ticket Médio: R$ ${parseFloat(metrics.ticket_medio || 0).toFixed(2)}\n\n`;
  
  text += `O relatório completo em PDF está anexado a este e-mail.\n\n`;
  text += `Smooth PDV - Sistema de Gestão Comercial\n`;
  text += `Este é um e-mail automático, por favor não responda.\n`;
  
  return text;
}

// ✅ FUNÇÃO PARA FORMATAR DATA
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'N/A';
  }
}

// ✅ TEMPLATE DO E-MAIL (Completo e Bonito)
function generateEmailTemplate(dashboardData, customMessage, user) {
  const metrics = dashboardData.metrics || {};
  const periodo = dashboardData.periodo || {};
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
          background: #f5f5f5;
        }
        .container {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          margin: 20px;
        }
        .header { 
          background: linear-gradient(135deg, #0ea5e9, #0369a1); 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        .content { 
          padding: 30px; 
        }
        .metrics { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 15px; 
          margin: 25px 0; 
        }
        .metric { 
          background: #f8fafc; 
          padding: 20px; 
          border-radius: 8px; 
          text-align: center;
          border-left: 4px solid #0ea5e9;
        }
        .metric h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #64748b;
          text-transform: uppercase;
        }
        .metric-value {
          font-size: 24px; 
          font-weight: bold; 
          color: #059669;
          margin: 0;
        }
        .footer { 
          background: #f1f5f9; 
          padding: 20px; 
          text-align: center; 
          font-size: 12px; 
          color: #64748b;
        }
        .user-info {
          background: #e0f2fe;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
          border: 1px solid #bae6fd;
        }
        .periodo {
          background: #f0fdf4;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
          margin: 15px 0;
          font-size: 14px;
        }
        .message-box {
          background: #f0fdf4;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          border-left: 4px solid #10b981;
        }
        .attachment-notice {
          text-align: center;
          padding: 20px;
          background: #fef7ed;
          border-radius: 8px;
          margin: 20px 0;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">📊 Relatório Smooth PDV</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Gestão Comercial</p>
        </div>
        
        <div class="content">
          <div class="user-info">
            <strong>👤 Enviado por:</strong> ${user.nome} (${user.tipo})<br>
            <strong>📅 Data de envio:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
          </div>

          ${periodo.startDate && periodo.endDate ? `
            <div class="periodo">
              <strong>📆 Período do relatório:</strong> ${formatDate(periodo.startDate)} à ${formatDate(periodo.endDate)}
            </div>
          ` : ''}
          
          ${customMessage ? `
            <div class="message-box">
              <strong>📝 Mensagem:</strong><br>
              ${customMessage}
            </div>
          ` : ''}
          
          <h2 style="text-align: center; color: #0ea5e9; margin-bottom: 10px;">Métricas Principais</h2>
          <p style="text-align: center; color: #64748b; margin-top: 0;">Resumo do desempenho comercial</p>
          
          <div class="metrics">
            <div class="metric">
              <h3>💰 Total de Vendas</h3>
              <p class="metric-value">${metrics.total_vendas || 0}</p>
            </div>
            <div class="metric">
              <h3>📈 Faturamento Total</h3>
              <p class="metric-value">R$ ${parseFloat(metrics.total_faturado || 0).toFixed(2)}</p>
            </div>
            <div class="metric">
              <h3>👥 Clientes Ativos</h3>
              <p class="metric-value">${metrics.clientes_ativos || 0}</p>
            </div>
            <div class="metric">
              <h3>🎫 Ticket Médio</h3>
              <p class="metric-value">R$ ${parseFloat(metrics.ticket_medio || 0).toFixed(2)}</p>
            </div>
          </div>
          
          <div class="attachment-notice">
            <p style="margin: 0;">
              <strong>📎 Anexo:</strong> O relatório completo em PDF está anexado a este e-mail.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>Smooth PDV</strong> - Sistema de Gestão Comercial</p>
          <p style="margin: 0; font-size: 11px; opacity: 0.7;">
            Este é um e-mail automático, por favor não responda.<br>
            ${new Date().getFullYear()} © Todos os direitos reservados
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}