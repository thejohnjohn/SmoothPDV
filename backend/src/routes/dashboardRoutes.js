// src/routes/dashboardRoutes.js - REFATORADO

import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { pdfController } from '../controllers/pdfController.js'; // 🆕 Importar pdfController
import { authMiddleware } from '../middleware/auth.js';
import { canGenerateReports } from '../middleware/permissions.js';

const router = Router();

router.use(authMiddleware);

// ✅ Rotas existentes do dashboard
router.get('/dashboard/admin', dashboardController.getAdminDashboard);
router.get('/dashboard/gerente', dashboardController.getGerenteDashboard);
router.get('/dashboard/vendedor', dashboardController.getVendedorDashboard);

// 🆕 NOVA ROTA: Relatório PDF do Dashboard (para atender frontend)
router.post('/reports/pdf', canGenerateReports, pdfController.generateDashboardPDF);

// 🆕 ROTA ALTERNATIVA: Se o frontend usa GET em vez de POST
router.get('/reports/pdf', canGenerateReports, (req, res) => {
  // Converter parâmetros GET para formato esperado pelo pdfController
  const reportData = {
    title: req.query.title || 'Relatório do Dashboard',
    reportType: req.query.reportType || 'dashboard',
    data: {
      periodo: {
        startDate: req.query.data_inicio || new Date().toISOString().split('T')[0],
        endDate: req.query.data_fim || new Date().toISOString().split('T')[0]
      },
      metrics: JSON.parse(req.query.metrics || '{}'),
      user: req.user
    },
    user: req.user
  };
  
  req.body = reportData;
  return pdfController.generateDashboardPDF(req, res);
});

export default router;