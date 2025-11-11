export class Usuario {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senha = data.senha;
    this.tipo = data.tipo;
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

  isCliente() {
    return this.tipo === 'CLIENTE';
  }

  canRegisterUsers() {
    return this.isAdmin() || this.isGerente();
  }

  canRegisterProducts() {
    return this.isAdmin() || this.isGerente() || this.isVendedor();
  }

  // Métodos estáticos
  static async findById(db, id) {
    const user = await db('usuario').where({ id }).first();
    return user ? new Usuario(user) : null;
  }

  static async findByEmail(db, email) {
    const user = await db('usuario').where({ email }).first();
    return user ? new Usuario(user) : null;
  }

  static async findAllClients(db) {
    const users = await db('usuario').where({ tipo: 'CLIENTE' });
    return users.map(user => new Usuario(user));
  }

  static async create(db, userData) {
    const [id] = await db('usuario').insert(userData).returning('id');
    return await Usuario.findById(db, id);
  }
}

export const TipoUsuario = {
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE', 
  VENDEDOR: 'VENDEDOR',
  CLIENTE: 'CLIENTE'
};