import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalItems,
} from '@modules/cart/controllers/cart-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate } from '@middleware/auth.js';
import { addToCartSchema, updateCartQuantitySchema } from '@modules/cart/validators/cart-validator.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.get('/count', getTotalItems);
router.post('/', validate(addToCartSchema), addToCart);
router.put('/:productId', validate(updateCartQuantitySchema), updateQuantity);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
