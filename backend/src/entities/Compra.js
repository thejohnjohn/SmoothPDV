export class Compra {
  constructor(data) {
    this.id = data.id;
    this.data = data.data;
    this.id_loja = data.id_loja;
    this.id_vendedor = data.id_vendedor;
    this.loja_nome = data.loja_nome;
    this.vendedor_nome = data.vendedor_nome;
  }

  static async findAll(db, user = null) {
    let query = db('compra')
      .leftJoin('loja', 'compra.id_loja', 'loja.id')
      .leftJoin('usuario as vendedor', 'compra.id_vendedor', 'vendedor.id')
      .select(
        'compra.*', 
        'loja.nome as loja_nome',
        'vendedor.nome as vendedor_nome'
      );

    // Filtro por loja se não for ADMIN
    if (user && !user.canAccessAllStores()) {
      query = query.where('compra.id_loja', user.id_loja);
    }
    
    const sales = await query;
    return sales.map(sale => new Compra(sale));
  }

  static async findById(db, id, user = null) {
    let query = db('compra')
      .leftJoin('loja', 'compra.id_loja', 'loja.id')
      .leftJoin('usuario as vendedor', 'compra.id_vendedor', 'vendedor.id')
      .select(
        'compra.*', 
        'loja.nome as loja_nome',
        'vendedor.nome as vendedor_nome'
      )
      .where('compra.id', id);

    // Filtro por loja se não for ADMIN
    if (user && !user.canAccessAllStores()) {
      query = query.where('compra.id_loja', user.id_loja);
    }

    const sale = await query.first();
    return sale ? new Compra(sale) : null;
  }

  static async create(db, saleData) {
    const [{ id }] = await db('compra').insert(saleData).returning('id');
    return await Compra.findById(db, id);
  }

  // Buscar por loja
  static async findByLoja(db, id_loja) {
    const sales = await db('compra')
      .leftJoin('loja', 'compra.id_loja', 'loja.id')
      .leftJoin('usuario as vendedor', 'compra.id_vendedor', 'vendedor.id')
      .select(
        'compra.*', 
        'loja.nome as loja_nome',
        'vendedor.nome as vendedor_nome'
      )
      .where('compra.id_loja', id_loja);
    return sales.map(sale => new Compra(sale));
  }

  // Buscar por vendedor
  static async findByVendedor(db, id_vendedor) {
    const sales = await db('compra')
      .leftJoin('loja', 'compra.id_loja', 'loja.id')
      .leftJoin('usuario as vendedor', 'compra.id_vendedor', 'vendedor.id')
      .select(
        'compra.*', 
        'loja.nome as loja_nome',
        'vendedor.nome as vendedor_nome'
      )
      .where('compra.id_vendedor', id_vendedor);
    return sales.map(sale => new Compra(sale));
  }
}