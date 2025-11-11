import { Router } from 'express';
import { saleController } from '../controllers/saleController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

router.get('/sales', saleController.getAllSales);
router.get('/sales/:id', saleController.getSaleById);
router.post('/sales', saleController.createSale);

export default router;