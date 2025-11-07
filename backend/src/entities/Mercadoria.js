export class Mercadoria {
  constructor(data) {
    this.id = data.id;
    this.descricao = data.descricao;
    this.preco = data.preco;
    this.id_usuario = data.id_usuario;
  }

  static async findAll(db) {
    const products = await db('mercadoria')
      .select('mercadoria.*', 'usuario.nome as vendedor_nome')
      .leftJoin('usuario', 'mercadoria.id_usuario', 'usuario.id');
    
    return products.map(product => new Mercadoria(product));
  }

  static async findById(db, id) {
    const product = await db('mercadoria')
      .where('mercadoria.id', id)
      .leftJoin('usuario', 'mercadoria.id_usuario', 'usuario.id')
      .select('mercadoria.*', 'usuario.nome as vendedor_nome')
      .first();
    
    return product ? new Mercadoria(product) : null;
  }

  static async create(db, productData) {
    const [id] = await db('mercadoria').insert(productData).returning('id');
    return await Mercadoria.findById(db, id);
  }
}