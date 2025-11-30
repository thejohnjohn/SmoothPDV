export class Mercadoria {
  constructor(data) {
    this.id = data.id;
    this.descricao = data.descricao;
    this.preco = data.preco;
    this.id_usuario = data.id_usuario;
    this.id_loja = data.id_loja;
    this.loja_nome = data.loja_nome;
    this.vendedor_nome = data.vendedor_nome;
  }

  static async findAll(db, user = null) {
    let query = db('mercadoria')
      .leftJoin('loja', 'mercadoria.id_loja', 'loja.id')
      .leftJoin('usuario', 'mercadoria.id_usuario', 'usuario.id')
      .select(
        'mercadoria.*', 
        'loja.nome as loja_nome',
        'usuario.nome as vendedor_nome'
      );

    // Filtro por loja se não for ADMIN
    if (user && !user.canAccessAllStores()) {
      query = query.where('mercadoria.id_loja', user.id_loja);
    }
    
    const products = await query;
    return products.map(product => new Mercadoria(product));
  }

  static async findById(db, id, user = null) {
    let query = db('mercadoria')
      .leftJoin('loja', 'mercadoria.id_loja', 'loja.id')
      .leftJoin('usuario', 'mercadoria.id_usuario', 'usuario.id')
      .select(
        'mercadoria.*', 
        'loja.nome as loja_nome',
        'usuario.nome as vendedor_nome'
      )
      .where('mercadoria.id', id);

    // Filtro por loja se não for ADMIN
    if (user && !user.canAccessAllStores()) {
      query = query.where('mercadoria.id_loja', user.id_loja);
    }

    const product = await query.first();
    return product ? new Mercadoria(product) : null;
  }

  static async create(db, productData) {
    const [{ id }] = await db('mercadoria').insert(productData).returning('id');
    return await Mercadoria.findById(db, id);
  }

  // Buscar por loja
  static async findByLoja(db, id_loja) {
    const products = await db('mercadoria')
      .leftJoin('loja', 'mercadoria.id_loja', 'loja.id')
      .leftJoin('usuario', 'mercadoria.id_usuario', 'usuario.id')
      .select(
        'mercadoria.*', 
        'loja.nome as loja_nome',
        'usuario.nome as vendedor_nome'
      )
      .where('mercadoria.id_loja', id_loja);
    return products.map(product => new Mercadoria(product));
  }

  static async update(db, id, updateData) {
    await db('mercadoria').where('id', id).update(updateData);
    return await Mercadoria.findById(db, id);
  }

  // 🆕 Deletar produto
  static async delete(db, id) {
    return await db('mercadoria').where('id', id).delete();
  }

  // 🆕 Verificar se produto existe na loja
  static async existsInStore(db, id, id_loja) {
    const product = await db('mercadoria')
      .where('id', id)
      .where('id_loja', id_loja)
      .first();
    return !!product;
  }

  // 🆕 Buscar produtos com estoque/estatísticas
  static async findWithStats(db, user = null) {
    let query = db('mercadoria as m')
      .leftJoin('loja', 'm.id_loja', 'loja.id')
      .leftJoin('usuario', 'm.id_usuario', 'usuario.id')
      .leftJoin('item_mercadoria as im', 'm.id', 'im.idmercadoria')
      .select(
        'm.*', 
        'loja.nome as loja_nome',
        'usuario.nome as vendedor_nome',
        req.db.raw('COALESCE(SUM(im.quantidade), 0) as total_vendido'),
        req.db.raw('COALESCE(SUM(im.quantidade * m.preco), 0) as faturamento_total')
      )
      .groupBy('m.id', 'loja.nome', 'usuario.nome');

    // Filtro por loja se não for ADMIN
    if (user && !user.canAccessAllStores()) {
      query = query.where('m.id_loja', user.id_loja);
    }
    
    const products = await query;
    return products.map(product => new Mercadoria(product));
  }
}