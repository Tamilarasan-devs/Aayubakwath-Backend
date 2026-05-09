import { Router } from 'express';
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from '@modules/coupon/controllers/coupon-controller.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import { idParamSchema, paginationSchema } from '@modules/product/validators/product-validator.js';
import { createCouponSchema, updateCouponSchema, applyCouponSchema } from '@modules/coupon/validators/coupon-validator.js';

const router = Router();

router.post('/apply', authenticate, validate(applyCouponSchema), applyCoupon);

router.get('/', authenticate, authorize('ADMIN', 'MODERATOR'), validate(paginationSchema, 'query'), getCoupons);
router.get('/:id', authenticate, authorize('ADMIN', 'MODERATOR'), validate(idParamSchema, 'params'), getCouponById);
router.post('/', authenticate, authorize('ADMIN', 'MODERATOR'), validate(createCouponSchema), createCoupon);
router.put('/:id', authenticate, authorize('ADMIN', 'MODERATOR'), validate(idParamSchema, 'params'), validate(updateCouponSchema), updateCoupon);
router.delete('/:id', authenticate, authorize('ADMIN'), validate(idParamSchema, 'params'), deleteCoupon);

export default router;

