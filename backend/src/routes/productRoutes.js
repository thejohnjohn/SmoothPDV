import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authMiddleware } from '../middleware/auth.js';
import { 
  canManageProducts,           
  validateProductStoreAccess
} from '../middleware/permissions.js';

const router = Router();

router.use(authMiddleware);

router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);

router.post('/products', canManageProducts, validateProductStoreAccess, productController.createProduct);
router.put('/products/:id', canManageProducts, productController.updateProduct);
router.delete('/products/:id', canManageProducts, productController.deleteProduct);
router.get('/store/products', canManageProducts, productController.getStoreProducts);
router.get('/store/products/stats', canManageProducts, productController.getProductsStats);

export default router;