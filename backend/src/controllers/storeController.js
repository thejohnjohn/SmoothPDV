// src/controllers/storeController.js - ATUALIZAR COMPLETO

export const storeController = {
  // 🆕 LISTAR TODAS AS LOJAS (apenas Admin)
  async getStores(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem listar lojas.' 
        });
      }

      const stores = await req.db('loja').select('*').orderBy('nome');
      res.json(stores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 BUSCAR LOJA POR ID (apenas Admin)
  async getStoreById(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem visualizar lojas.' 
        });
      }

      const store = await req.db('loja').where({ id: req.params.id }).first();
      
      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      res.json(store);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 CRIAR LOJA (apenas Admin)
  async createStore(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem criar lojas.' 
        });
      }

      const { nome, endereco, telefone, email, cnpj } = req.body;

      // Validações básicas
      if (!nome) {
        return res.status(400).json({ error: 'Nome da loja é obrigatório' });
      }

      // Verificar se CNPJ já existe
      if (cnpj) {
        const existingStore = await req.db('loja').where({ cnpj }).first();
        if (existingStore) {
          return res.status(400).json({ error: 'CNPJ já cadastrado' });
        }
      }

      const [{ id }] = await req.db('loja').insert({
        nome,
        endereco,
        telefone,
        email,
        cnpj,
        ativo: true
      }).returning('id');
      
      const store = await req.db('loja').where({ id }).first();
      
      res.status(201).json({
        message: 'Loja criada com sucesso',
        store
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ATUALIZAR LOJA (apenas Admin)
  async updateStore(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem atualizar lojas.' 
        });
      }

      const { id } = req.params;
      const { nome, endereco, telefone, email, cnpj, ativo } = req.body;

      // Verificar se loja existe
      const existingStore = await req.db('loja').where({ id }).first();
      if (!existingStore) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      // Verificar se CNPJ já existe (excluindo a própria loja)
      if (cnpj && cnpj !== existingStore.cnpj) {
        const cnpjExists = await req.db('loja')
          .where({ cnpj })
          .whereNot('id', id)
          .first();
        
        if (cnpjExists) {
          return res.status(400).json({ error: 'CNPJ já está em uso' });
        }
      }

      // Preparar dados para atualização
      const updateData = {};
      if (nome !== undefined) updateData.nome = nome;
      if (endereco !== undefined) updateData.endereco = endereco;
      if (telefone !== undefined) updateData.telefone = telefone;
      if (email !== undefined) updateData.email = email;
      if (cnpj !== undefined) updateData.cnpj = cnpj;
      if (ativo !== undefined) updateData.ativo = ativo;

      await req.db('loja').where({ id }).update(updateData);

      // Buscar loja atualizada
      const updatedStore = await req.db('loja').where({ id }).first();

      res.json({
        message: 'Loja atualizada com sucesso',
        store: updatedStore
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 DELETAR LOJA (apenas Admin)
  async deleteStore(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem deletar lojas.' 
        });
      }

      const { id } = req.params;

      // Verificar se loja existe
      const store = await req.db('loja').where({ id }).first();
      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      // Verificar se loja tem usuários associados
      const hasUsers = await req.db('usuario')
        .where('id_loja', id)
        .first();

      // Verificar se loja tem vendas associadas
      const hasSales = await req.db('compra')
        .where('id_loja', id)
        .first();

      // Verificar se loja tem produtos associados
      const hasProducts = await req.db('mercadoria')
        .where('id_loja', id)
        .first();

      if (hasUsers || hasSales || hasProducts) {
        return res.status(400).json({ 
          error: 'Não é possível excluir loja com usuários, vendas ou produtos associados.' 
        });
      }

      await req.db('loja').where({ id }).delete();

      res.json({ message: 'Loja excluída com sucesso' });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ATIVAR/DESATIVAR LOJA (apenas Admin)
  async toggleStoreStatus(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem alterar status de lojas.' 
        });
      }

      const { id } = req.params;
      const { ativo } = req.body;

      // Verificar se loja existe
      const store = await req.db('loja').where({ id }).first();
      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      await req.db('loja').where({ id }).update({ ativo });

      res.json({
        message: `Loja ${ativo ? 'ativada' : 'desativada'} com sucesso`,
        ativo
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ MÉTODO EXISTENTE - Estatísticas da loja (Admin e Gerente da loja)
  async getStoreStats(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Verificar permissão
      if (!user.isAdmin() && user.id_loja !== parseInt(id)) {
        return res.status(403).json({ 
          error: 'Acesso negado a esta loja.' 
        });
      }

      const stats = await req.db('compra as c')
        .leftJoin('pagamento as p', 'c.id', 'p.idcompra')
        .where('c.id_loja', id)
        .select(
          req.db.raw('COUNT(DISTINCT c.id) as total_vendas'),
          req.db.raw('COALESCE(SUM(p.valor), 0) as total_faturado'),
          req.db.raw('COUNT(DISTINCT c.id_vendedor) as total_vendedores'),
          req.db.raw('(SELECT COUNT(*) FROM mercadoria WHERE id_loja = ?) as total_produtos', [id]),
          req.db.raw('(SELECT COUNT(*) FROM usuario WHERE id_loja = ? AND tipo = ?) as total_gerentes', [id, 'GERENTE']),
          req.db.raw('(SELECT COUNT(*) FROM usuario WHERE id_loja = ? AND tipo = ?) as total_vendedores', [id, 'VENDEDOR'])
        )
        .first();

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};