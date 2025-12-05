import { BaseEntity } from './BaseEntity.js';

export class Loja extends BaseEntity {
  static tableName = 'loja';

  constructor(data) {
    super(data); // Herda id, deleted, deleted_at, deleted_by, criado_em
    this.nome = data.nome;
    this.cnpj = data.cnpj;
    this.endereco = data.endereco;
    this.telefone = data.telefone;
    this.email = data.email;
    this.ativo = data.ativo !== undefined ? data.ativo : true;
  }

  // 🆕 MÉTODOS ESTÁTICOS COM SOFT DELETE

  static async findById(db, id, includeDeleted = false) {
    let query = db('loja')
      .where('id', id);

    if (!includeDeleted) {
      query = query.where('deleted', false);
    }

    const store = await query.first();
    return store ? new Loja(store) : null;
  }

  static async findByCnpj(db, cnpj, includeDeleted = false) {
    let query = db('loja')
      .where('cnpj', cnpj);

    if (!includeDeleted) {
      query = query.where('deleted', false);
    }

    const store = await query.first();
    return store ? new Loja(store) : null;
  }

  static async findAll(db, includeDeleted = false) {
    let query = db('loja').select('*');

    if (!includeDeleted) {
      query = query.where('deleted', false);
    }

    const stores = await query.orderBy('nome');
    return stores.map(store => new Loja(store));
  }

  static async findActive(db, includeDeleted = false) {
    let query = db('loja')
      .where('ativo', true);

    if (!includeDeleted) {
      query = query.where('deleted', false);
    }

    const stores = await query.orderBy('nome');
    return stores.map(store => new Loja(store));
  }

  static async create(db, storeData) {
    // 🆕 Garantir que ativo tem valor padrão
    const data = {
      ativo: true,
      ...storeData
    };

    const [store] = await db('loja')
      .insert(data)
      .returning('*');
    
    return new Loja(store);
  }

  static async update(db, id, updateData) {
    await db('loja')
      .where('id', id)
      .update(updateData);

    // Retornar loja atualizada
    return await Loja.findById(db, id);
  }

  // 🆕 Métodos específicos para soft delete

  static async softDelete(db, id, userId) {
    return await db('loja')
      .where('id', id)
      .update({
        deleted: true,
        deleted_at: new Date(),
        deleted_by: userId,
        ativo: false // Desativa ao deletar
      });
  }

  static async restore(db, id, userId) {
    return await db('loja')
      .where('id', id)
      .where('deleted', true)
      .update({
        deleted: false,
        deleted_at: null,
        deleted_by: null,
        ativo: true // Reativa ao restaurar
      });
  }

  static async findDeleted(db) {
    const stores = await db('loja')
      .where('deleted', true)
      .orderBy('deleted_at', 'desc');
    
    return stores.map(store => new Loja(store));
  }

  static async toggleStatus(db, id, ativo) {
    return await db('loja')
      .where('id', id)
      .update({ ativo });
  }

  // 🆕 Métodos de estatísticas

  static async getStats(db, lojaId) {
    const stats = await db('compra as c')
      .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
      .where('c.id_loja', lojaId)
      .select(
        db.raw('COUNT(DISTINCT c.id) as total_vendas'),
        db.raw('COALESCE(SUM(p.valor), 0) as total_faturado'),
        db.raw('COUNT(DISTINCT c.id_vendedor) as total_vendedores'),
        db.raw('(SELECT COUNT(*) FROM mercadoria WHERE id_loja = ?) as total_produtos', [lojaId]),
        db.raw('(SELECT COUNT(*) FROM usuario WHERE id_loja = ? AND tipo = ?) as total_gerentes', [lojaId, 'GERENTE']),
        db.raw('(SELECT COUNT(*) FROM usuario WHERE id_loja = ? AND tipo = ?) as total_vendedores', [lojaId, 'VENDEDOR'])
      )
      .first();

    return stats;
  }

  // 🆕 Métodos auxiliares

  static async hasUsers(db, lojaId) {
    const count = await db('usuario')
      .where('id_loja', lojaId)
      .where('deleted', false)
      .count('* as total')
      .first();
    
    return parseInt(count.total) > 0;
  }

  static async hasSales(db, lojaId) {
    const count = await db('compra')
      .where('id_loja', lojaId)
      .where('deleted', false)
      .count('* as total')
      .first();
    
    return parseInt(count.total) > 0;
  }

  static async hasProducts(db, lojaId) {
    const count = await db('mercadoria')
      .where('id_loja', lojaId)
      .where('deleted', false)
      .count('* as total')
      .first();
    
    return parseInt(count.total) > 0;
  }

  // 🆕 Métodos de validação

  static async validateCnpj(db, cnpj, excludeId = null) {
    let query = db('loja').where('cnpj', cnpj);

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const existing = await query.first();
    return !existing; // Retorna true se CNPJ for válido (não existe)
  }

  // 🆕 Método para restaurar com validação
  static async safeRestore(db, id, userId) {
    const store = await db('loja')
      .where('id', id)
      .where('deleted', true)
      .first();

    if (!store) {
      throw new Error('Loja deletada não encontrada');
    }

    return await Loja.restore(db, id, userId);
  }
}