import { Router } from 'express';
import { pdfController } from '../controllers/pdfController.js';
import { emailController } from '../controllers/emailController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/reports/pdf', pdfController.generateDashboardPDF);
router.post('/reports/email', emailController.sendReportEmail);

export default router;
//router.post('/reports/excel', reportController.generateExcelReport);
