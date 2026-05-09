import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '@modules/product/controllers/product-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { uploadMultiple } from '@middleware/upload.js';
import { createProductSchema, updateProductSchema, paginationSchema, idParamSchema } from '@modules/product/validators/product-validator.js';

const router = Router();

router.get('/', validate(paginationSchema, 'query'), getAllProducts);
router.get('/search', authenticate, searchProducts);
router.get('/:id', validate(idParamSchema, 'params'), getProductById);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  uploadMultiple('images', 10),
  validate(createProductSchema),
  createProduct
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(idParamSchema, 'params'),
  uploadMultiple('images', 10),
  validate(updateProductSchema),
  updateProduct
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  deleteProduct
);

export default router;
