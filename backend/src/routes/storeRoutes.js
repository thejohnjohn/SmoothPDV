// src/routes/storeRoutes.js - ATUALIZAR COMPLETO

import { Router } from 'express';
import { storeController } from '../controllers/storeController.js';
import { authMiddleware } from '../middleware/auth.js';
import { canManageStores } from '../middleware/permissions.js'; // 🆕 NOVO

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// 🆕 ROTAS CRUD COMPLETO PARA LOJAS (apenas ADMIN)
router.get('/stores', canManageStores, storeController.getStores);
router.get('/stores/:id', canManageStores, storeController.getStoreById);
router.post('/stores', canManageStores, storeController.createStore);
router.put('/stores/:id', canManageStores, storeController.updateStore);
router.delete('/stores/:id', canManageStores, storeController.deleteStore);
router.patch('/stores/:id/status', canManageStores, storeController.toggleStoreStatus);

// ✅ ROTA EXISTENTE - Estatísticas (Admin + Gerente da loja)
router.get('/stores/:id/stats', storeController.getStoreStats);

export default router;