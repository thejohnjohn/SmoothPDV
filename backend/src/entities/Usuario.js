export class Usuario {
  constructor(data) {
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

  // ADMIN não tem loja específica
  canAccessAllStores() {
    return this.isAdmin();
  }

  // Métodos estáticos
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

  // Buscar usuários por loja
  static async findByLoja(db, id_loja) {
    const users = await db('usuario')
      .leftJoin('loja', 'usuario.id_loja', 'loja.id')
      .select('usuario.*', 'loja.nome as loja_nome')
      .where('usuario.id_loja', id_loja);
    return users.map(user => new Usuario(user));
  }

  // Buscar vendedores por loja
  static async findVendedoresByLoja(db, id_loja) {
    const users = await db('usuario')
      .leftJoin('loja', 'usuario.id_loja', 'loja.id')
      .select('usuario.*', 'loja.nome as loja_nome')
      .where('usuario.id_loja', id_loja)
      .where('usuario.tipo', 'VENDEDOR');
    return users.map(user => new Usuario(user));
  }
}

export const TipoUsuario = {
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE', 
  VENDEDOR: 'VENDEDOR'
};