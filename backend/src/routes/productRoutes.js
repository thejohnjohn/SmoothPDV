import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authMiddleware } from '../middleware/auth.js';
import { canRegisterProducts } from '../middleware/permissions.js';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware);

// Apenas usuários autorizados podem criar produtos
router.post('/products', canRegisterProducts, productController.createProduct);

// Todos usuários autenticados podem listar e ver produtos
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);

export default router;