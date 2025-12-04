// src/routes/publicRoutes.js - NOVO ARQUIVO

import { Router } from 'express';
import { publicController } from '../controllers/publicController.js';

const router = Router();

// 🆕 ROTAS PÚBLICAS (sem autenticação)
router.get('/download/invoice/:saleId', publicController.downloadInvoiceBySaleId);

export default router;