import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from '@modules/order/controllers/order-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { createOrderSchema } from '@modules/cart/validators/cart-validator.js';
import { paginationSchema, idParamSchema } from '@modules/product/validators/product-validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), createOrder);
router.get('/', validate(paginationSchema, 'query'), getOrders);
router.get('/:id', validate(idParamSchema, 'params'), getOrderById);
router.patch('/:id/status', authorize('ADMIN', 'MODERATOR'), updateOrderStatus);
router.get('/admin/all', authorize('ADMIN', 'MODERATOR'), getAllOrders);

export default router;
