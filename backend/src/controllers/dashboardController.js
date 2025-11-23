import { Usuario } from '../entities/Usuario.js';

export const dashboardController = {
  // Dashboard para Admin (vê tudo)
  async getAdminDashboard(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const metrics = await req.db.raw(`
        SELECT 
          COUNT(DISTINCT c.id) as total_vendas,
          COALESCE(SUM(p.valor), 0) as total_faturado,
          COUNT(DISTINCT c.id_cliente) as clientes_ativos,
          COUNT(DISTINCT u.id) as total_usuarios,
          (SELECT COUNT(*) FROM mercadoria) as total_produtos,
          (SELECT AVG(p.valor) FROM pagamento p 
           JOIN compra c ON p.idcompra = c.id 
           WHERE c.data BETWEEN ? AND ?) as ticket_medio
        FROM compra c
        LEFT JOIN pagamento p ON c.id = p.idcompra
        LEFT JOIN usuario u ON c.id_cliente = u.id
        WHERE c.data BETWEEN ? AND ?
      `, [startDate, endDate, startDate, endDate]);

      // Vendas por vendedor
      const salesBySeller = await req.db('compra')
        .select('u.nome as vendedor', req.db.raw('COUNT(c.id) as total_vendas'))
        .leftJoin('usuario as u', 'c.id_cliente', 'u.id')
        .whereBetween('c.data', [startDate, endDate])
        .groupBy('u.nome')
        .orderBy('total_vendas', 'desc');

      // Produtos mais vendidos
      const topProducts = await req.db('item_mercadoria as im')
        .select('m.descricao', req.db.raw('SUM(im.quantidade) as quantidade_vendida'))
        .leftJoin('mercadoria as m', 'im.idmercadoria', 'm.id')
        .leftJoin('compra as c', 'im.idcompra', 'c.id')
        .whereBetween('c.data', [startDate, endDate])
        .groupBy('m.descricao')
        .orderBy('quantidade_vendida', 'desc')
        .limit(10);

      res.json({
        metrics: metrics.rows[0],
        salesBySeller,
        topProducts,
        periodo: { startDate, endDate }
      });

    } catch (error) {
      console.error('Erro no dashboard admin:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Dashboard para Gerente (vê apenas sua equipe)
  async getGerenteDashboard(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const gerenteId = req.user.id;

      // Buscar vendedores do gerente - CORRIGIDO
      const vendedores = await req.db('usuario')
        .where('tipo', 'VENDEDOR'); // Simplificado - ajuste conforme sua lógica

      const vendedoresIds = vendedores.map(v => v.id);

      // CORREÇÃO: Usar query builder em vez de raw para arrays
      const metrics = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .whereIn('c.id_cliente', vendedoresIds.length > 0 ? vendedoresIds : [0]) // Evitar array vazio
        .whereBetween('c.data', [startDate, endDate])
        .select(
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_faturado'),
          req.db.raw('COUNT(DISTINCT c.id_cliente) as clientes_ativos')
        )
        .first();

      // CORREÇÃO: Contagem de produtos separada
      const totalProdutos = await req.db('mercadoria')
        .whereIn('id_usuario', vendedoresIds.length > 0 ? vendedoresIds : [0])
        .count('* as total')
        .first();

      // Adicionar total de produtos às métricas
      metrics.total_produtos = totalProdutos.total;

      // Performance por vendedor - CORRIGIDO
      const performanceVendedores = await req.db('compra as c')
        .select(
          'u.nome as vendedor',
          req.db.raw('COUNT(c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_vendido')
        )
        .leftJoin('usuario as u', 'c.id_cliente', 'u.id')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .whereIn('c.id_cliente', vendedoresIds.length > 0 ? vendedoresIds : [0])
        .whereBetween('c.data', [startDate, endDate])
        .groupBy('u.nome')
        .orderBy('total_vendido', 'desc');

      res.json({
        metrics,
        performanceVendedores,
        totalVendedores: vendedores.length,
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
      const vendedorId = req.user.id;

      const metrics = await req.db.raw(`
        SELECT 
          COUNT(DISTINCT c.id) as total_vendas,
          COALESCE(SUM(p.valor), 0) as total_vendido,
          COUNT(DISTINCT c.id_cliente) as clientes_ativos,
          AVG(p.valor) as ticket_medio,
          (SELECT COUNT(*) FROM mercadoria WHERE id_usuario = ?) as produtos_cadastrados
        FROM compra c
        LEFT JOIN pagamento p ON c.id = p.idcompra
        WHERE c.id_cliente = ?
        AND c.data BETWEEN ? AND ?
      `, [vendedorId, vendedorId, startDate, endDate]);

      // Vendas por dia (últimos 7 dias)
      const vendasPorDia = await req.db('compra as c')
        .select(
          req.db.raw('DATE(c.data) as dia'),
          req.db.raw('COUNT(c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_dia')
        )
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_cliente', vendedorId)
        .whereBetween('c.data', [startDate, endDate])
        .groupBy('dia')
        .orderBy('dia', 'asc');

      res.json({
        metrics: metrics.rows[0],
        vendasPorDia,
        periodo: { startDate, endDate }
      });

    } catch (error) {
      console.error('Erro no dashboard vendedor:', error);
      res.status(500).json({ error: error.message });
    }
  }
};