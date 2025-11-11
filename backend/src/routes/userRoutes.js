import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { canRegisterUsers } from '../middleware/permissions.js';

const router = Router();

// Todas as rotas exigem autenticação e permissão para cadastrar usuários
router.use(authMiddleware, canRegisterUsers);

router.post('/users', userController.createUser);
router.get('/users', userController.getUsers);

export default router;