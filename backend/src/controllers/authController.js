import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Usuario, TipoUsuario } from '../entities/Usuario.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smooth-pdv-secret-key';
const SALT_ROUNDS = 10;

export const authController = {
  async register(req, res) {
    try {
      const { nome, email, senha } = req.body;

      const existingUser = await Usuario.findByEmail(req.db, email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);

      const userData = {
        nome,
        email,
        senha: hashedPassword,
        tipo: TipoUsuario.CLIENTE
      };

      const user = await Usuario.create(req.db, userData);

      const token = jwt.sign(
        { userId: user.id, tipo: user.tipo }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo
        },
        token
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const user = await Usuario.findByEmail(req.db, email);

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const validPassword = await bcrypt.compare(senha, user.senha);

      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { userId: user.id, tipo: user.tipo }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        user,
        token
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProfile(req, res) {
    try {
      res.json({
        user: {
          id: req.user.id,
          nome: req.user.nome,
          email: req.user.email,
          tipo: req.user.tipo,
          criado_em: req.user.criado_em
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};