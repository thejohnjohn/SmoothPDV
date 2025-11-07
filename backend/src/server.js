import express from 'express';
import cors from 'cors';
import db from './config/db.js';
import saleRoutes from './routes/saleRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

const app = express();
const PORT = 3000;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Database middleware
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api', saleRoutes);
app.use('/api', productRoutes);
app.use('/api', customerRoutes);

// Health Check
app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'Disconnected' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});