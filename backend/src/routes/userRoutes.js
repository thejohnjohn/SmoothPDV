// src/routes/userRoutes.js - ATUALIZAR

import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { 
  canRegisterUsers, 
  canManageManagers,
  canManageSellers,
  validateSellerStoreAccess  // 🆕 NOVO
} from '../middleware/permissions.js';

const router = Router();        

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// 🆕 ROTAS ESPECÍFICAS PARA VENDEDORES (ADMIN + GERENTE)
router.post('/sellers', canManageSellers, validateSellerStoreAccess, userController.createSeller);
router.get('/sellers', canManageSellers, userController.getSellers);
router.get('/sellers/:id', canManageSellers, userController.getSellerById);
router.put('/sellers/:id', canManageSellers, userController.updateSeller);
router.delete('/sellers/:id', canManageSellers, userController.deleteSeller);
router.get('/sellers/:id/stats', canManageSellers, userController.getSellerStats);

// Rotas existentes para gerentes
router.post('/managers', canManageManagers, userController.createManager);
router.get('/managers', canManageManagers, userController.getManagers);
router.get('/managers/:id', canManageManagers, userController.getManagerById);
router.put('/managers/:id', canManageManagers, userController.updateManager);
router.delete('/managers/:id', canManageManagers, userController.deleteManager);

// Rotas gerais de usuários
router.post('/users', canRegisterUsers, userController.createUser);
router.get('/users', userController.getUsers);

export default router;