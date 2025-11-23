import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard/admin', dashboardController.getAdminDashboard);
router.get('/dashboard/gerente', dashboardController.getGerenteDashboard);
router.get('/dashboard/vendedor', dashboardController.getVendedorDashboard);

export default router;