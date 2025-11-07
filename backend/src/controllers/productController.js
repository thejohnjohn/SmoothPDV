import { Mercadoria } from '../entities/Mercadoria.js';

export const productController = {
  async getAllProducts(req, res) {
    try {
      const products = await Mercadoria.findAll(req.db);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const product = await Mercadoria.findById(req.db, req.params.id);
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createProduct(req, res) {
    try {
      const product = await Mercadoria.create(req.db, req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};