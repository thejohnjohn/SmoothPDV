import { BaseEntity } from './BaseEntity.js';

export class Usuario extends BaseEntity{
  static tableName = 'usuario';

  constructor(data) {
    super(data);
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senha = data.senha;
    this.tipo = data.tipo;
    this.id_loja = data.id_loja;
    this.loja_nome = data.loja_nome;
    this.criado_em = data.criado_em;
  }

  // Métodos de permissão
  isAdmin() {
    return this.tipo === 'ADMIN';
  }

  isGerente() {
    return this.tipo === 'GERENTE';
  }

  isVendedor() {
    return this.tipo === 'VENDEDOR';
  }

  canAccessAllStores() {
    return this.isAdmin();
  }

  static async findById(db, id) {
    const user = await db('usuario')
      .leftJoin('loja', 'usuario.id_loja', 'loja.id')
      .select('usuario.*', 'loja.nome as loja_nome')
      .where('usuario.id', id)
      .first();
    return user ? new Usuario(user) : null;
  }

  static async findByEmail(db, email) {
    const user = await db('usuario')
      .leftJoin('loja', 'usuario.id_loja', 'loja.id')
      .select('usuario.*', 'loja.nome as loja_nome')
      .where('usuario.email', email)
      .first();
    return user ? new Usuario(user) : null;
  }

  static async create(db, userData) {
    const [{ id }] = await db('usuario').insert(userData).returning('id');
    return await Usuario.findById(db, id);
  }

  static async findByLoja(db, id_loja) {
    const users = await db('usuario')
      .leftJoin('loja', 'usuario.id_loja', 'loja.id')
      .select('usuario.*', 'loja.nome as loja_nome')
      .where('usuario.id_loja', id_loja);
    return users.map(user => new Usuario(user));
  }

  static async findVendedoresByLoja(db, id_loja) {
    const users = await db('usuario')
      .leftJoin('loja', 'usuario.id_loja', 'loja.id')
      .select('usuario.*', 'loja.nome as loja_nome')
      .where('usuario.id_loja', id_loja)
      .where('usuario.tipo', 'VENDEDOR');
    return users.map(user => new Usuario(user));
  }

  static async findByEmail(db, email, includeDeleted = false) {
    let query = db('usuario')
      .leftJoin('loja', 'usuario.id_loja', 'loja.id')
      .select('usuario.*', 'loja.nome as loja_nome')
      .where('usuario.email', email);

    if (!includeDeleted) {
      query = query.where('usuario.deleted', false);
    }

    const user = await query.first();
    return user ? new Usuario(user) : null;
  }

  static async findDeleted(db) {
    const users = await db('usuario')
      .leftJoin('loja', 'usuario.id_loja', 'loja.id')
      .select('usuario.*', 'loja.nome as loja_nome')
      .where('usuario.deleted', true);
    
    return users.map(user => new Usuario(user));
  }
}

export const TipoUsuario = {
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE', 
  VENDEDOR: 'VENDEDOR'
};