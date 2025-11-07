import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';

const router = Router();

router.get('/customers', customerController.getAllCustomers);
router.get('/customers/:id', customerController.getCustomerById);
router.post('/customers', customerController.createCustomer);

export default router;