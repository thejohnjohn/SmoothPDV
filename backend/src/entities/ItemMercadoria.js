export class ItemMercadoria {
  constructor(data) {
    this.id = data.id;
    this.quantidade = data.quantidade;
    this.idmercadoria = data.idmercadoria;
    this.idcompra = data.idcompra;
    this.descricao = data.descricao;
    this.preco = data.preco;
  }

  static async findBySaleId(db, saleId) {
    const items = await db('item_mercadoria')
      .where('idcompra', saleId)
      .leftJoin('mercadoria', 'item_mercadoria.idmercadoria', 'mercadoria.id')
      .select('item_mercadoria.*', 'mercadoria.descricao', 'mercadoria.preco');
    
    return items.map(item => new ItemMercadoria(item));
  }

  static async createMultiple(db, items) {
    await db('item_mercadoria').insert(items);
  }
}