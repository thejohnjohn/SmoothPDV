import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import db from './config/db.js';

// Rotas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

const PORT = process.env.API_PORT;
const HOST = process.env.API_HOST;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database middleware
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api', saleRoutes);
app.use('/api', productRoutes);
app.use('/api', customerRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', reportRoutes);
app.use('/api', userRoutes);

// Health Check
app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Smooth PDV API com Autenticação rodando na porta ${PORT}`);
  console.log(`📍 Health: http://${HOST}:${PORT}/health`);
  console.log(`🔐 Auth: http:///${HOST}:${PORT}/api/auth`);
});
