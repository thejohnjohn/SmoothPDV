export class Compra {
  constructor(data) {
    this.id = data.id;
    this.data = data.data;
    this.id_cliente = data.id_cliente;
    this.cliente_nome = data.cliente_nome;
  }

  static async findAll(db) {
    const sales = await db('compra')
      .select('compra.*', 'usuario.nome as cliente_nome')
      .leftJoin('usuario', 'compra.id_cliente', 'usuario.id');
    
    return sales.map(sale => new Compra(sale));
  }

  static async findById(db, id) {
    const sale = await db('compra')
      .where('compra.id', id)
      .leftJoin('usuario', 'compra.id_cliente', 'usuario.id')
      .select('compra.*', 'usuario.nome as cliente_nome')
      .first();
    
    return sale ? new Compra(sale) : null;
  }

  static async create(db, saleData) {
    const [id] = await db('compra').insert(saleData).returning('id');
    return await Compra.findById(db, id);
  }
}