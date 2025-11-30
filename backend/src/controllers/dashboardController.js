export const dashboardController = {
  // Dashboard para Admin (vê todas as lojas)
  async getAdminDashboard(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      // Métricas totais (todas as lojas)
      const metrics = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .leftJoin('loja as l', 'c.id_loja', 'l.id')
        .whereBetween('c.data', [startDate, endDate])
        .select(
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_faturado'),
          req.db.raw('COUNT(DISTINCT c.id_vendedor) as vendedores_ativos'),
          req.db.raw('COUNT(DISTINCT l.id) as lojas_ativas'),
          req.db.raw('(SELECT COUNT(*) FROM usuario WHERE tipo = \'VENDEDOR\') as total_vendedores'),
          req.db.raw('COALESCE(SUM(p.valor) / NULLIF(COUNT(DISTINCT c.id), 0), 0) as ticket_medio')
        )
        .first();

      // Vendas por vendedor (todas as lojas)
      const salesBySeller = await req.db('compra as c')
        .select(
          'u.nome as vendedor',
          'l.nome as loja',
          req.db.raw('COUNT(c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_vendido')
        )
        .leftJoin('usuario as u', 'c.id_vendedor', 'u.id')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .leftJoin('loja as l', 'c.id_loja', 'l.id')
        .whereBetween('c.data', [startDate, endDate])
        .groupBy('u.nome', 'l.nome')
        .orderBy('total_vendido', 'desc');

      // Vendas por loja
      const salesByStore = await req.db('compra as c')
        .select(
          'l.nome as loja',
          req.db.raw('COUNT(c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_faturado')
        )
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .leftJoin('loja as l', 'c.id_loja', 'l.id')
        .whereBetween('c.data', [startDate, endDate])
        .groupBy('l.nome')
        .orderBy('total_faturado', 'desc');

      res.json({
        metrics,
        salesBySeller,
        salesByStore,
        periodo: { startDate, endDate }
      });

    } catch (error) {
      console.error('Erro no dashboard admin:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Dashboard para Gerente (vê apenas sua loja)
async getGerenteDashboard(req, res) {
    try {
      const currentUser = req.user;
      const { data_inicio, data_fim } = req.query;

      console.log('📊 Iniciando dashboard do gerente para loja:', currentUser.id_loja);

      // 🆕 CORREÇÃO: Validar se usuário é gerente
      if (!currentUser.isGerente()) {
        return res.status(403).json({ 
          error: 'Acesso negado. Apenas gerentes podem acessar este dashboard.' 
        });
      }

      // 🆕 CORREÇÃO: Definir período padrão (últimos 30 dias)
      const endDate = data_fim || new Date().toISOString().split('T')[0];
      const startDate = data_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      console.log(`📅 Período: ${startDate} à ${endDate}`);

      // 🆕 CORREÇÃO: Buscar métricas principais com nomes de colunas corretos
      const metrics = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_loja', currentUser.id_loja)
        .whereBetween('c.data', [startDate, endDate]) // 🆕 CORREÇÃO: Usar nome correto da coluna
        .select(
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_faturado'),
          req.db.raw('COUNT(DISTINCT c.id_vendedor) as vendedores_ativos'),
          req.db.raw('(SELECT COUNT(*) FROM usuario WHERE id_loja = ? AND tipo = ?) as total_vendedores', [currentUser.id_loja, 'VENDEDOR']),
          req.db.raw('(SELECT COUNT(*) FROM mercadoria WHERE id_loja = ?) as total_produtos', [currentUser.id_loja]),
          req.db.raw('COALESCE(SUM(p.valor) / NULLIF(COUNT(DISTINCT c.id), 0), 0) as ticket_medio')
        )
        .first();

      console.log('✅ Métricas principais obtidas:', metrics);

      // 🆕 CORREÇÃO: Vendas por dia (últimos 7 dias)
      const vendasPorDia = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_loja', currentUser.id_loja)
        .where('c.data', '>=', req.db.raw("CURRENT_DATE - INTERVAL '7 days'")) // 🆕 CORREÇÃO
        .groupBy(req.db.raw('DATE(c.data)'))
        .select(
          req.db.raw('DATE(c.data) as dia'),
          req.db.raw('COUNT(*) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_dia')
        )
        .orderBy('dia', 'desc');

      console.log(`✅ ${vendasPorDia.length} dias com vendas`);

      // 🆕 CORREÇÃO: Performance dos vendedores
      const performanceVendedores = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .leftJoin('usuario as v', 'c.id_vendedor', 'v.id')
        .where('c.id_loja', currentUser.id_loja)
        .whereBetween('c.data', [startDate, endDate]) // 🆕 CORREÇÃO
        .groupBy('v.id', 'v.nome')
        .select(
          'v.id',
          'v.nome as vendedor',
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_vendido'),
          req.db.raw('COALESCE(AVG(p.valor), 0) as ticket_medio')
        )
        .orderBy('total_vendido', 'desc');

      console.log(`✅ ${performanceVendedores.length} vendedores com performance`);

      // 🆕 CORREÇÃO: Métodos de pagamento mais usados
      const metodosPagamento = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_loja', currentUser.id_loja)
        .whereBetween('c.data', [startDate, endDate]) // 🆕 CORREÇÃO
        .groupBy('p.metodo_pagamento')
        .select(
          'p.metodo_pagamento',
          req.db.raw('COUNT(*) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_valor')
        )
        .orderBy('total_vendas', 'desc');

      console.log(`✅ ${metodosPagamento.length} métodos de pagamento analisados`);

      // 🆕 CORREÇÃO: Produtos mais vendidos
      const produtosMaisVendidos = await req.db('item_mercadoria as im')
        .leftJoin('mercadoria as m', 'im.idmercadoria', 'm.id')
        .leftJoin('compra as c', 'im.idcompra', 'c.id')
        .where('m.id_loja', currentUser.id_loja)
        .whereBetween('c.data', [startDate, endDate]) // 🆕 CORREÇÃO
        .groupBy('m.id', 'm.descricao', 'm.preco')
        .select(
          'm.id',
          'm.descricao',
          'm.preco',
          req.db.raw('SUM(im.quantidade) as quantidade_vendida'),
          req.db.raw('SUM(im.quantidade * m.preco) as faturamento_total')
        )
        .orderBy('quantidade_vendida', 'desc')
        .limit(10);

      console.log(`✅ ${produtosMaisVendidos.length} produtos mais vendidos`);

      // 🆕 CORREÇÃO: Resposta consolidada
      const dashboardData = {
        periodo: {
          startDate: startDate,
          endDate: endDate
        },
        metrics: {
          ...metrics,
          // 🆕 Métricas adicionais calculadas
          dias_com_vendas: vendasPorDia.length,
          produtos_mais_vendidos_count: produtosMaisVendidos.length
        },
        vendas_por_dia: vendasPorDia,
        performance_vendedores: performanceVendedores,
        metodos_pagamento: metodosPagamento,
        produtos_mais_vendidos: produtosMaisVendidos,
        loja: {
          id: currentUser.id_loja,
          nome: currentUser.loja_nome || 'Minha Loja'
        }
      };

      console.log('✅ Dashboard do gerente gerado com sucesso');

      res.json(dashboardData);

    } catch (error) {
      console.error('❌ Erro ao gerar dashboard do gerente:', error);
      
      // 🆕 CORREÇÃO: Mensagem de erro mais específica
      let errorMessage = error.message;
      
      if (error.message.includes('c.data') && error.message.includes('Undefined column')) {
        errorMessage = 'Erro de estrutura do banco: coluna "data" não encontrada na tabela compra. Verifique o nome correto da coluna de data.';
      }
      
      res.status(500).json({ 
        error: 'Erro ao carregar dashboard',
        details: errorMessage
      });
    }
  },

  // Dashboard para Vendedor (vê apenas seus dados)
  async getVendedorDashboard(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const user = req.user;

      const metrics = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_vendedor', user.id)
        .whereBetween('c.data', [startDate, endDate])
        .select(
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_vendido'),
          req.db.raw('COALESCE(SUM(p.valor) / NULLIF(COUNT(DISTINCT c.id), 0), 0) as ticket_medio'),
          req.db.raw('(SELECT COUNT(*) FROM mercadoria WHERE id_usuario = ?) as produtos_cadastrados', [user.id])
        )
        .first();

      // Vendas por dia
      const vendasPorDia = await req.db('compra as c')
        .select(
          req.db.raw('DATE(c.data) as dia'),
          req.db.raw('COUNT(c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_dia')
        )
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_vendedor', user.id)
        .whereBetween('c.data', [startDate, endDate])
        .groupBy('dia')
        .orderBy('dia', 'asc');

      res.json({
        metrics,
        vendasPorDia,
        periodo: { startDate, endDate }
      });

    } catch (error) {
      console.error('Erro no dashboard vendedor:', error);
      res.status(500).json({ error: error.message });
    }
  }
};