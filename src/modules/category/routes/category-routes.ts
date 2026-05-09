import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '@modules/category/controllers/category-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { uploadSingle } from '@middleware/upload.js';
import { createCategorySchema, updateCategorySchema } from '@modules/category/validators/category-validator.js';
import { idParamSchema } from '@modules/product/validators/product-validator.js';

const router = Router();

router.get('/', getAllCategories);
router.get('/:id', validate(idParamSchema, 'params'), getCategoryById);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  uploadSingle('image'),
  validate(createCategorySchema),
  createCategory
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(idParamSchema, 'params'),
  uploadSingle('image'),
  validate(updateCategorySchema),
  updateCategory
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  deleteCategory
);

export default router;
