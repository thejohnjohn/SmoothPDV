import { Router } from 'express';
import { saleController } from '../controllers/saleController.js';

const router = Router();

router.get('/sales', saleController.getAllSales);
router.get('/sales/:id', saleController.getSaleById);
router.post('/sales', saleController.createSale);

export default router;