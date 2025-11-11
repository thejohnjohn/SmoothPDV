import jwt from 'jsonwebtoken';
import { Usuario } from '../entities/Usuario.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smooth-pdv-secret-key';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await Usuario.findById(req.db, decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};