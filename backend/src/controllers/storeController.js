// src/controllers/storeController.js - ATUALIZADO

import { Loja } from '../entities/Loja.js';

export const storeController = {
  // 🆕 ATUALIZADO: Listar lojas usando entidade
  async getStores(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem listar lojas.' 
        });
      }

      const { include_deleted } = req.query;
      const includeDeleted = include_deleted === 'true';
      
      const stores = await Loja.findAll(req.db, includeDeleted);
      res.json(stores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ATUALIZADO: Buscar loja por ID usando entidade
  async getStoreById(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem visualizar lojas.' 
        });
      }

      const store = await Loja.findById(req.db, req.params.id);
      
      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      res.json(store);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ATUALIZADO: Criar loja usando entidade
  async createStore(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem criar lojas.' 
        });
      }

      const { nome, endereco, telefone, email, cnpj } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'Nome da loja é obrigatório' });
      }

      // Validar CNPJ usando entidade
      if (cnpj) {
        const cnpjIsValid = await Loja.validateCnpj(req.db, cnpj);
        if (!cnpjIsValid) {
          return res.status(400).json({ error: 'CNPJ já cadastrado' });
        }
      }

      const storeData = {
        nome,
        endereco,
        telefone,
        email,
        cnpj,
        ativo: true
      };

      const store = await Loja.create(req.db, storeData);
      
      res.status(201).json({
        message: 'Loja criada com sucesso',
        store
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ATUALIZADO: Atualizar loja usando entidade
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
      const existingStore = await Loja.findById(req.db, id);
      if (!existingStore) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      // Validar CNPJ (excluindo a própria loja)
      if (cnpj && cnpj !== existingStore.cnpj) {
        const cnpjIsValid = await Loja.validateCnpj(req.db, cnpj, id);
        if (!cnpjIsValid) {
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

      const updatedStore = await Loja.update(req.db, id, updateData);

      res.json({
        message: 'Loja atualizada com sucesso',
        store: updatedStore
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ATUALIZADO: Deletar loja usando entidade
  async deleteStore(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem deletar lojas.' 
        });
      }

      const { id } = req.params;

      // Verificar se loja existe e não está deletada
      const store = await Loja.findById(req.db, id);
      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      // 🆕 Verificar se loja tem dependências (opcional)
      const hasUsers = await Loja.hasUsers(req.db, id);
      const hasSales = await Loja.hasSales(req.db, id);
      const hasProducts = await Loja.hasProducts(req.db, id);

      if (hasUsers || hasSales || hasProducts) {
        return res.status(400).json({
          error: 'Não é possível excluir loja com usuários, vendas ou produtos associados.',
          has_users: hasUsers,
          has_sales: hasSales,
          has_products: hasProducts
        });
      }

      // Soft delete usando entidade
      await Loja.softDelete(req.db, id, req.user.id);

      res.json({ 
        message: 'Loja excluída com sucesso',
        deleted_at: new Date(),
        can_restore: true
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ATUALIZADO: Ativar/desativar loja usando entidade
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
      const store = await Loja.findById(req.db, id);
      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      await Loja.toggleStatus(req.db, id, ativo);

      res.json({
        message: `Loja ${ativo ? 'ativada' : 'desativada'} com sucesso`,
        ativo
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 NOVO: Restaurar loja deletada
  async restoreStore(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem restaurar lojas.' 
        });
      }

      const { id } = req.params;

      await Loja.safeRestore(req.db, id, req.user.id);

      res.json({ 
        message: 'Loja restaurada com sucesso',
        restored_at: new Date()
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 NOVO: Listar lojas deletadas
  async getDeletedStores(req, res) {
    try {
      if (!req.user.isAdmin()) {
        return res.status(403).json({ 
          error: 'Apenas administradores podem ver lojas deletadas.' 
        });
      }

      const stores = await Loja.findDeleted(req.db);
      res.json(stores);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ ATUALIZADO: Estatísticas da loja usando entidade
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

      const stats = await Loja.getStats(req.db, id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};