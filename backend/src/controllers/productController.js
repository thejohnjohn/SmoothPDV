// src/controllers/productController.js - ATUALIZAR COMPLETO

import { Mercadoria } from '../entities/Mercadoria.js';

export const productController = {
  // ✅ MÉTODO EXISTENTE - Listar produtos (todos os usuários autenticados)
  async getAllProducts(req, res) {
    try {
      const products = await Mercadoria.findAll(req.db, req.user);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ MÉTODO EXISTENTE - Buscar produto por ID
  async getProductById(req, res) {
    try {
      const product = await Mercadoria.findById(req.db, req.params.id, req.user);
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 CRIAR PRODUTO (apenas Gerente)
  async createProduct(req, res) {
    try {
      const currentUser = req.user;

      // Apenas gerentes podem criar produtos
      if (!currentUser.isGerente()) {
        return res.status(403).json({ 
          error: 'Apenas gerentes podem cadastrar produtos.' 
        });
      }

      const { descricao, preco } = req.body;

      // Validações
      if (!descricao) {
        return res.status(400).json({ error: 'Descrição do produto é obrigatória' });
      }

      if (!preco || preco <= 0) {
        return res.status(400).json({ error: 'Preço deve ser maior que zero' });
      }

      // Criar produto na loja do gerente
      const productData = {
        descricao,
        preco: parseFloat(preco),
        id_loja: currentUser.id_loja, // Gerente só cria na sua loja
        id_usuario: currentUser.id    // Quem cadastrou
      };

      const product = await Mercadoria.create(req.db, productData);
      
      res.status(201).json({
        message: 'Produto criado com sucesso',
        product
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ATUALIZAR PRODUTO (apenas Gerente da loja)
  async updateProduct(req, res) {
    try {
      const currentUser = req.user;
      const { id } = req.params;
      const { descricao, preco } = req.body;

      // Apenas gerentes podem atualizar produtos
      if (!currentUser.isGerente()) {
        return res.status(403).json({ 
          error: 'Apenas gerentes podem atualizar produtos.' 
        });
      }

      // Buscar produto existente
      const existingProduct = await req.db('mercadoria')
        .where('id', id)
        .first();

      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Verificar se produto pertence à loja do gerente
      if (existingProduct.id_loja !== currentUser.id_loja) {
        return res.status(403).json({ 
          error: 'Você só pode atualizar produtos da sua loja.' 
        });
      }

      // Preparar dados para atualização
      const updateData = {};
      if (descricao) updateData.descricao = descricao;
      if (preco) updateData.preco = parseFloat(preco);

      // Validar se há dados para atualizar
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'Nenhum dado fornecido para atualização' });
      }

      await req.db('mercadoria')
        .where('id', id)
        .update(updateData);

      // Buscar produto atualizado
      const updatedProduct = await Mercadoria.findById(req.db, id, req.user);

      res.json({
        message: 'Produto atualizado com sucesso',
        product: updatedProduct
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 DELETAR PRODUTO (apenas Gerente da loja)
  async deleteProduct(req, res) {
    try {
      const currentUser = req.user;
      const { id } = req.params;

      // Apenas gerentes podem deletar produtos
      if (!currentUser.isGerente()) {
        return res.status(403).json({ 
          error: 'Apenas gerentes podem excluir produtos.' 
        });
      }

      // Buscar produto existente
      const existingProduct = await req.db('mercadoria')
        .where('id', id)
        .first();

      if (!existingProduct) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Verificar se produto pertence à loja do gerente
      if (existingProduct.id_loja !== currentUser.id_loja) {
        return res.status(403).json({ 
          error: 'Você só pode excluir produtos da sua loja.' 
        });
      }

      // Verificar se produto está em vendas
      const hasSales = await req.db('item_mercadoria')
        .where('idmercadoria', id)
        .first();

      if (hasSales) {
        return res.status(400).json({ 
          error: 'Não é possível excluir produto com vendas associadas.' 
        });
      }

      await req.db('mercadoria').where('id', id).delete();

      res.json({ message: 'Produto excluído com sucesso' });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 LISTAR PRODUTOS DA LOJA DO GERENTE
  async getStoreProducts(req, res) {
    try {
      const currentUser = req.user;

      // Apenas gerentes podem listar produtos específicos da loja
      if (!currentUser.isGerente()) {
        return res.status(403).json({ 
          error: 'Apenas gerentes podem listar produtos da loja.' 
        });
      }

      const products = await Mercadoria.findByLoja(req.db, currentUser.id_loja);

      res.json(products);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // 🆕 ESTATÍSTICAS DE PRODUTOS (apenas Gerente)
  async getProductsStats(req, res) {
    try {
      const currentUser = req.user;

      // Apenas gerentes podem ver estatísticas
      if (!currentUser.isGerente()) {
        return res.status(403).json({ 
          error: 'Apenas gerentes podem visualizar estatísticas de produtos.' 
        });
      }

      const stats = await req.db('mercadoria as m')
        .leftJoin('item_mercadoria as im', 'm.id', 'im.idmercadoria')
        .leftJoin('compra as c', 'im.idcompra', 'c.id')
        .where('m.id_loja', currentUser.id_loja)
        .select(
          req.db.raw('COUNT(DISTINCT m.id) as total_produtos'),
          req.db.raw('COUNT(DISTINCT im.idmercadoria) as produtos_vendidos'),
          req.db.raw('COALESCE(SUM(im.quantidade), 0) as total_vendido'),
          req.db.raw('COALESCE(SUM(im.quantidade * m.preco), 0) as faturamento_produtos'),
          req.db.raw('(SELECT COUNT(*) FROM mercadoria WHERE id_loja = ? AND id NOT IN (SELECT DISTINCT idmercadoria FROM item_mercadoria)) as produtos_nao_vendidos', [currentUser.id_loja])
        )
        .first();

      // Produtos mais vendidos
      const topProducts = await req.db('mercadoria as m')
        .leftJoin('item_mercadoria as im', 'm.id', 'im.idmercadoria')
        .leftJoin('compra as c', 'im.idcompra', 'c.id')
        .where('m.id_loja', currentUser.id_loja)
        .select(
          'm.id',
          'm.descricao',
          'm.preco',
          req.db.raw('COALESCE(SUM(im.quantidade), 0) as total_vendido'),
          req.db.raw('COALESCE(SUM(im.quantidade * m.preco), 0) as faturamento')
        )
        .groupBy('m.id', 'm.descricao', 'm.preco')
        .orderBy('total_vendido', 'desc')
        .limit(10);

      res.json({
        estatisticas_gerais: stats,
        produtos_mais_vendidos: topProducts
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};