import bcrypt from 'bcryptjs';
import { Usuario, TipoUsuario } from '../entities/Usuario.js';

const SALT_ROUNDS = 10;

export const userController = {
  // Cadastrar usuário (apenas Admin e Gerente)
  async createUser(req, res) {
    try {
      const { nome, email, senha, tipo } = req.body;
      const currentUser = req.user;

      // Validações de permissão
      if (tipo === TipoUsuario.ADMIN && !currentUser.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem cadastrar outros administradores.' 
        });
      }

      if (tipo === TipoUsuario.GERENTE && !currentUser.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem cadastrar gerentes.' 
        });
      }

      if (tipo === TipoUsuario.VENDEDOR && currentUser.isVendedor()) {
        return res.status(403).json({ 
          error: 'Vendedores não podem cadastrar outros usuários.' 
        });
      }

      // Verificar se email já existe
      const existingUser = await Usuario.findByEmail(req.db, email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);

      // Criar usuário
      const userData = {
        nome,
        email,
        senha: hashedPassword,
        tipo
      };

      const user = await Usuario.create(req.db, userData);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          criado_em: user.criado_em
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Listar usuários (apenas Admin e Gerente)
  async getUsers(req, res) {
    try {
      const { tipo } = req.query;
      let query = req.db('usuario');

      // Filtro por tipo se especificado
      if (tipo) {
        query = query.where('tipo', tipo);
      }

      // Gerentes só veem vendedores e clientes
      if (req.user.isGerente()) {
        query = query.whereIn('tipo', [TipoUsuario.VENDEDOR, TipoUsuario.CLIENTE]);
      }

      // Admins veem todos
      const users = await query.select('id', 'nome', 'email', 'tipo', 'criado_em');

      res.json(users);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};