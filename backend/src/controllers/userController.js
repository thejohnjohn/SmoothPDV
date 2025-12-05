import bcrypt from 'bcryptjs';
import { Usuario, TipoUsuario } from '../entities/Usuario.js';

const SALT_ROUNDS = 10;

export const userController = {
  async createUser(req, res) {
    try {
      const { nome, email, senha, tipo, id_loja } = req.body;
      const currentUser = req.user;

      // Validações de permissão
      if (tipo === TipoUsuario.ADMIN && !currentUser.isAdmin()) {
        return res.status(403).json({
          error: 'Apenas administradores podem cadastrar outros administradores.'
        });
      }

      // Gerentes só podem cadastrar vendedores na SUA loja
      if (tipo === TipoUsuario.VENDEDOR && currentUser.isGerente()) {
        if (id_loja !== currentUser.id_loja) {
          return res.status(403).json({
            error: 'Gerentes só podem cadastrar vendedores na sua própria loja.'
          });
        }
      }

      // Vendedores não podem cadastrar usuários
      if (currentUser.isVendedor()) {
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

      // ADMIN não tem loja específica
      const userLoja = tipo === TipoUsuario.ADMIN ? null : id_loja;

      // Criar usuário
      const userData = {
        nome,
        email,
        senha: hashedPassword,
        tipo,
        id_loja: userLoja
      };

      const user = await Usuario.create(req.db, userData);

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          id_loja: user.id_loja,
          loja_nome: user.loja_nome,
          criado_em: user.criado_em
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getUsers(req, res) {
    try {
      const { tipo, id_loja } = req.query;
      let query = req.db('usuario')
        .leftJoin('loja', 'usuario.id_loja', 'loja.id')
        .select('usuario.*', 'loja.nome as loja_nome');

      // Filtro por tipo se especificado
      if (tipo) {
        query = query.where('usuario.tipo', tipo);
      }

      // Filtro por loja se especificado
      if (id_loja) {
        query = query.where('usuario.id_loja', id_loja);
      }

      // Gerentes só veem usuários da SUA loja
      if (req.user.isGerente()) {
        query = query.where('usuario.id_loja', req.user.id_loja)
          .whereIn('usuario.tipo', [TipoUsuario.VENDEDOR]);
      }

      // Vendedores não podem ver outros usuários
      if (req.user.isVendedor()) {
        return res.status(403).json({
          error: 'Vendedores não podem listar usuários.'
        });
      }

      const users = await query;

      res.json(users);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 CRUD ESPECÍFICO PARA GERENTES (apenas ADMIN)
  async createManager(req, res) {
    try {
      const { nome, email, senha, id_loja } = req.body;

      // Apenas ADMIN pode criar gerentes (já validado no middleware)
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          error: 'Apenas administradores podem cadastrar gerentes.'
        });
      }

      // Validar loja
      if (!id_loja) {
        return res.status(400).json({ error: 'Loja é obrigatória para gerentes.' });
      }

      // Verificar se email já existe
      const existingUser = await Usuario.findByEmail(req.db, email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);

      // Criar gerente
      const userData = {
        nome,
        email,
        senha: hashedPassword,
        tipo: TipoUsuario.GERENTE,
        id_loja
      };

      const user = await Usuario.create(req.db, userData);

      res.status(201).json({
        message: 'Gerente criado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          id_loja: user.id_loja,
          loja_nome: user.loja_nome,
          criado_em: user.criado_em
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 Listar apenas gerentes
  async getManagers(req, res) {
    try {
      // Apenas ADMIN pode listar gerentes
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          error: 'Apenas administradores podem listar gerentes.'
        });
      }

      const { id_loja } = req.query;

      let query = req.db('usuario')
        .leftJoin('loja', 'usuario.id_loja', 'loja.id')
        .select('usuario.*', 'loja.nome as loja_nome')
        .where('usuario.tipo', TipoUsuario.GERENTE);

      // Filtro por loja se especificado
      if (id_loja) {
        query = query.where('usuario.id_loja', id_loja);
      }

      const managers = await query;

      res.json(managers);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 Buscar gerente por ID
  async getManagerById(req, res) {
    try {
      // Apenas ADMIN pode ver detalhes de gerentes
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          error: 'Apenas administradores podem visualizar gerentes.'
        });
      }

      const manager = await req.db('usuario')
        .leftJoin('loja', 'usuario.id_loja', 'loja.id')
        .select('usuario.*', 'loja.nome as loja_nome')
        .where('usuario.id', req.params.id)
        .where('usuario.tipo', TipoUsuario.GERENTE)
        .first();

      if (!manager) {
        return res.status(404).json({ error: 'Gerente não encontrado' });
      }

      res.json(manager);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 Atualizar gerente
  async updateManager(req, res) {
    try {
      // Apenas ADMIN pode atualizar gerentes
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          error: 'Apenas administradores podem atualizar gerentes.'
        });
      }

      const { id } = req.params;
      const { nome, email, id_loja } = req.body;

      // Verificar se gerente existe
      const existingManager = await req.db('usuario')
        .where('id', id)
        .where('tipo', TipoUsuario.GERENTE)
        .first();

      if (!existingManager) {
        return res.status(404).json({ error: 'Gerente não encontrado' });
      }

      // Verificar se email já existe (excluindo o próprio usuário)
      if (email && email !== existingManager.email) {
        const emailExists = await req.db('usuario')
          .where('email', email)
          .whereNot('id', id)
          .first();

        if (emailExists) {
          return res.status(400).json({ error: 'Email já está em uso' });
        }
      }

      // Atualizar dados
      const updateData = {};
      if (nome) updateData.nome = nome;
      if (email) updateData.email = email;
      if (id_loja) updateData.id_loja = id_loja;

      await req.db('usuario')
        .where('id', id)
        .update(updateData);

      // Buscar gerente atualizado
      const updatedManager = await req.db('usuario')
        .leftJoin('loja', 'usuario.id_loja', 'loja.id')
        .select('usuario.*', 'loja.nome as loja_nome')
        .where('usuario.id', id)
        .first();

      res.json({
        message: 'Gerente atualizado com sucesso',
        user: updatedManager
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteManager(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          error: 'Apenas administradores podem deletar gerentes.'
        });
      }

      const { id } = req.params;

      // Verificar se gerente existe e não está deletado
      const manager = await req.db('usuario')
        .where('id', id)
        .where('tipo', TipoUsuario.GERENTE)
        .where('deleted', false)
        .first();

      if (!manager) {
        return res.status(404).json({ error: 'Gerente não encontrado' });
      }

      // 🆕 SOFT DELETE em vez de delete físico
      await Usuario.softDelete(req.db, id, req.user.id);

      res.json({
        message: 'Gerente excluído com sucesso',
        deleted_at: new Date(),
        can_restore: true
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async restoreManager(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          error: 'Apenas administradores podem restaurar gerentes.'
        });
      }

      const { id } = req.params;

      const manager = await req.db('usuario')
        .where('id', id)
        .where('tipo', TipoUsuario.GERENTE)
        .where('deleted', true)
        .first();

      if (!manager) {
        return res.status(404).json({ error: 'Gerente deletado não encontrado' });
      }

      await Usuario.restore(req.db, id, req.user.id);

      res.json({
        message: 'Gerente restaurado com sucesso',
        restored_at: new Date()
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 NOVO: Listar gerentes deletados (apenas admin)
  async getDeletedManagers(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({
          error: 'Apenas administradores podem ver gerentes deletados.'
        });
      }

      const managers = await Usuario.findDeleted(req.db, TipoUsuario.GERENTE);

      res.json(managers);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createSeller(req, res) {
    try {
      const { nome, email, senha, id_loja } = req.body;
      const currentUser = req.user;

      // Validações de permissão por loja
      if (currentUser.isGerente() && id_loja !== currentUser.id_loja) {
        return res.status(403).json({
          error: 'Gerentes só podem cadastrar vendedores na sua própria loja.'
        });
      }

      // Verificar se email já existe
      const existingUser = await Usuario.findByEmail(req.db, email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Validar loja para vendedor
      if (!id_loja) {
        return res.status(400).json({ error: 'Loja é obrigatória para vendedores.' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);

      // Criar vendedor
      const userData = {
        nome,
        email,
        senha: hashedPassword,
        tipo: TipoUsuario.VENDEDOR,
        id_loja
      };

      const user = await Usuario.create(req.db, userData);

      res.status(201).json({
        message: 'Vendedor criado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
          id_loja: user.id_loja,
          loja_nome: user.loja_nome,
          criado_em: user.criado_em
        }
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 Listar vendedores com filtros por loja
  async getSellers(req, res) {
    try {
      const { id_loja } = req.query;
      const currentUser = req.user;

      let query = req.db('usuario')
        .leftJoin('loja', 'usuario.id_loja', 'loja.id')
        .select('usuario.*', 'loja.nome as loja_nome')
        .where('usuario.tipo', TipoUsuario.VENDEDOR);

      // ADMIN pode filtrar por qualquer loja, GERENTE só vê sua loja
      if (currentUser.isGerente()) {
        query = query.where('usuario.id_loja', currentUser.id_loja);
      } else if (id_loja && currentUser.isAdmin()) {
        query = query.where('usuario.id_loja', id_loja);
      }

      const sellers = await query;

      res.json(sellers);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSellerById(req, res) {
    try {
      const seller = await req.db('usuario')
        .leftJoin('loja', 'usuario.id_loja', 'loja.id')
        .select('usuario.*', 'loja.nome as loja_nome')
        .where('usuario.id', req.params.id)
        .where('usuario.tipo', TipoUsuario.VENDEDOR)
        .first();

      if (!seller) {
        return res.status(404).json({ error: 'Vendedor não encontrado' });
      }

      // Validar acesso: GERENTE só pode ver vendedores da sua loja
      if (req.user.isGerente() && seller.id_loja !== req.user.id_loja) {
        return res.status(403).json({
          error: 'Acesso negado. Você só pode visualizar vendedores da sua loja.'
        });
      }

      res.json(seller);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 Atualizar vendedor
  async updateSeller(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, id_loja } = req.body;
      const currentUser = req.user;

      // Verificar se vendedor existe
      const existingSeller = await req.db('usuario')
        .where('id', id)
        .where('tipo', TipoUsuario.VENDEDOR)
        .first();

      if (!existingSeller) {
        return res.status(404).json({ error: 'Vendedor não encontrado' });
      }

      // Validar permissões de loja
      if (currentUser.isGerente()) {
        // Gerente só pode editar vendedores da SUA loja
        if (existingSeller.id_loja !== currentUser.id_loja) {
          return res.status(403).json({
            error: 'Você só pode editar vendedores da sua loja.'
          });
        }
        // Gerente não pode transferir vendedor para outra loja
        if (id_loja && id_loja !== currentUser.id_loja) {
          return res.status(403).json({
            error: 'Gerentes não podem transferir vendedores para outras lojas.'
          });
        }
      }

      // Verificar se email já existe (excluindo o próprio usuário)
      if (email && email !== existingSeller.email) {
        const emailExists = await req.db('usuario')
          .where('email', email)
          .whereNot('id', id)
          .first();

        if (emailExists) {
          return res.status(400).json({ error: 'Email já está em uso' });
        }
      }

      // Preparar dados para atualização
      const updateData = {};
      if (nome) updateData.nome = nome;
      if (email) updateData.email = email;
      // Apenas ADMIN pode mudar a loja do vendedor
      if (id_loja && currentUser.isAdmin()) {
        updateData.id_loja = id_loja;
      }

      await req.db('usuario')
        .where('id', id)
        .update(updateData);

      // Buscar vendedor atualizado
      const updatedSeller = await req.db('usuario')
        .leftJoin('loja', 'usuario.id_loja', 'loja.id')
        .select('usuario.*', 'loja.nome as loja_nome')
        .where('usuario.id', id)
        .first();

      res.json({
        message: 'Vendedor atualizado com sucesso',
        user: updatedSeller
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 Estatísticas do vendedor
  async getSellerStats(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Verificar se vendedor existe e tem permissão
      const seller = await req.db('usuario')
        .where('id', id)
        .where('tipo', TipoUsuario.VENDEDOR)
        .first();

      if (!seller) {
        return res.status(404).json({ error: 'Vendedor não encontrado' });
      }

      // Validar acesso: GERENTE só pode ver stats de vendedores da sua loja
      if (currentUser.isGerente() && seller.id_loja !== currentUser.id_loja) {
        return res.status(403).json({
          error: 'Acesso negado aos dados deste vendedor.'
        });
      }

      // Buscar estatísticas do vendedor
      const stats = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_vendedor', id)
        .select(
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_vendido'),
          req.db.raw('AVG(p.valor) as ticket_medio'),
          req.db.raw('MAX(c.data) as ultima_venda')
        )
        .first();

      res.json({
        vendedor: {
          id: seller.id,
          nome: seller.nome,
          email: seller.email,
          loja_id: seller.id_loja
        },
        estatisticas: stats
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // 🆕 Estatísticas do vendedor
  async getSellerStats(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      // Verificar se vendedor existe e tem permissão
      const seller = await req.db('usuario')
        .where('id', id)
        .where('tipo', TipoUsuario.VENDEDOR)
        .first();

      if (!seller) {
        return res.status(404).json({ error: 'Vendedor não encontrado' });
      }

      // Validar acesso: GERENTE só pode ver stats de vendedores da sua loja
      if (currentUser.isGerente() && seller.id_loja !== currentUser.id_loja) {
        return res.status(403).json({
          error: 'Acesso negado aos dados deste vendedor.'
        });
      }

      // Buscar estatísticas do vendedor
      const stats = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_vendedor', id)
        .select(
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_vendido'),
          req.db.raw('AVG(p.valor) as ticket_medio'),
          req.db.raw('MAX(c.data) as ultima_venda')
        )
        .first();

      res.json({
        vendedor: {
          id: seller.id,
          nome: seller.nome,
          email: seller.email,
          loja_id: seller.id_loja
        },
        estatisticas: stats
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteSeller(req, res) {
    try {
      const { id } = req.params;
      const currentUser = req.user;

      const seller = await req.db('usuario')
        .where('id', id)
        .where('tipo', TipoUsuario.VENDEDOR)
        .where('deleted', false)
        .first();

      if (!seller) {
        return res.status(404).json({ error: 'Vendedor não encontrado' });
      }

      if (currentUser.isGerente() && seller.id_loja !== currentUser.id_loja) {
        return res.status(403).json({
          error: 'Você só pode excluir vendedores da sua loja.'
        });
      }

      await Usuario.softDelete(req.db, id, currentUser.id);

      res.json({
        message: 'Vendedor excluído com sucesso',
        deleted_at: new Date(),
        can_restore: true
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};