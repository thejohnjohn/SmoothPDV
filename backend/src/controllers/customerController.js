import { Usuario } from '../entities/Usuario.js';

export const customerController = {
  async getAllCustomers(req, res) {
    try {
      const customers = await Usuario.findAllClients(req.db);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCustomerById(req, res) {
    try {
      const customer = await Usuario.findById(req.db, req.params.id);
      
      if (!customer) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createCustomer(req, res) {
    try {
      const customerData = {
        ...req.body,
        tipo: 'CLIENTE'
      };
      
      const [id] = await req.db('usuario').insert(customerData).returning('id');
      const customer = await Usuario.findById(req.db, id);
      
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};