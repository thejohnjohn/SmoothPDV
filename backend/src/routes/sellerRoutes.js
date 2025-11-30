// src/routes/sellerRoutes.js - NOVO ARQUIVO

import { Router } from 'express';
import { saleController } from '../controllers/saleController.js';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/auth.js';
import { 
  requireSeller,
  canSell,
  canGenerateReports
} from '../middleware/permissions.js';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// 🆕 ROTAS DE VENDA (Vendedor + Gerente + Admin)
router.post('/seller/sales/quick', canSell, saleController.createQuickSale);
router.get('/seller/sales', requireSeller, saleController.getMySales);
router.get('/seller/sales/:id', requireSeller, saleController.getMySaleById);
router.get('/seller/stats', requireSeller, saleController.getMyStats);

// 🆕 ROTAS DE RELATÓRIOS (Vendedor + Gerente + Admin)
router.post('/seller/reports/pdf', canGenerateReports, reportController.generateSellerReport);
router.post('/seller/reports/email', canGenerateReports, reportController.sendSellerReportEmail);
router.post('/seller/reports/invoice', canGenerateReports, reportController.generateInvoice);

export default router;