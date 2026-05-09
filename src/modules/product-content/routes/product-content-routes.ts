import { Router } from 'express';
import {
  createProductContent,
  getAllProductContents,
  getProductContent,
  updateProductContent,
  deleteProductContent,
} from '@modules/product-content/controllers/product-content-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { createProductContentSchema, updateProductContentSchema } from '@modules/product-content/validators/product-content-validator.js';
import { idParamSchema } from '@modules/product/validators/product-validator.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'MODERATOR'), getAllProductContents);

router.get(
  '/:productId',
  validate(idParamSchema, 'params'),
  getProductContent
);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(createProductContentSchema),
  createProductContent
);
router.put(
  '/:productId',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(idParamSchema, 'params'),
  validate(updateProductContentSchema),
  updateProductContent
);
router.delete(
  '/:productId',
  authenticate,
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  deleteProductContent
);

export default router;
