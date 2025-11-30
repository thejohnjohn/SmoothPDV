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
      const { startDate, endDate } = req.query;
      const user = req.user;

      // Métricas da loja do gerente
      const metrics = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_loja', user.id_loja)
        .whereBetween('c.data', [startDate, endDate])
        .select(
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_faturado'),
          req.db.raw('COUNT(DISTINCT c.id_vendedor) as vendedores_ativos'),
          req.db.raw('(SELECT COUNT(*) FROM usuario WHERE id_loja = ? AND tipo = \'VENDEDOR\') as total_vendedores', [user.id_loja]),
          req.db.raw('(SELECT COUNT(*) FROM mercadoria WHERE id_loja = ?) as total_produtos', [user.id_loja]),
          req.db.raw('COALESCE(SUM(p.valor) / NULLIF(COUNT(DISTINCT c.id), 0), 0) as ticket_medio')
        )
        .first();

      // Performance por vendedor (apenas da loja do gerente)
      const performanceVendedores = await req.db('compra as c')
        .select(
          'u.nome as vendedor',
          req.db.raw('COUNT(c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_vendido')
        )
        .leftJoin('usuario as u', 'c.id_vendedor', 'u.id')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_loja', user.id_loja)
        .whereBetween('c.data', [startDate, endDate])
        .groupBy('u.nome')
        .orderBy('total_vendido', 'desc');

      // Produtos mais vendidos na loja
      const topProducts = await req.db('item_mercadoria as im')
        .select(
          'm.descricao',
          req.db.raw('SUM(im.quantidade) as quantidade_vendida'),
          req.db.raw('SUM(im.quantidade * m.preco) as total_vendido')
        )
        .leftJoin('mercadoria as m', 'im.idmercadoria', 'm.id')
        .leftJoin('compra as c', 'im.idcompra', 'c.id')
        .where('c.id_loja', user.id_loja)
        .whereBetween('c.data', [startDate, endDate])
        .groupBy('m.descricao')
        .orderBy('quantidade_vendida', 'desc')
        .limit(10);

      res.json({
        metrics,
        performanceVendedores,
        topProducts,
        periodo: { startDate, endDate }
      });

    } catch (error) {
      console.error('Erro no dashboard gerente:', error);
      res.status(500).json({ error: error.message });
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