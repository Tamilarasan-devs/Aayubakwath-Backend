import { Router } from 'express';
import {
  createCategoryBanner,
  getAllCategoryBanners,
  getCategoryBannerById,
  updateCategoryBanner,
  deleteCategoryBanner,
  deleteAllCategoryBanners,
} from '@modules/banner/controllers/banner-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { uploadSingle } from '@middleware/upload.js';
import { createCategoryBannerSchema, updateCategoryBannerSchema } from '@modules/banner/validators/banner-validator.js';
import { idParamSchema } from '@modules/product/validators/product-validator.js';

const router = Router();

router.get('/', getAllCategoryBanners);

router.delete(
  '/bulk',
  authenticate,
  authorize('ADMIN'),
  deleteAllCategoryBanners
);

router.get('/:id', validate(idParamSchema, 'params'), getCategoryBannerById);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  uploadSingle('image'),
  validate(createCategoryBannerSchema),
  createCategoryBanner
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(idParamSchema, 'params'),
  uploadSingle('image'),
  validate(updateCategoryBannerSchema),
  updateCategoryBanner
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  deleteCategoryBanner
);

export default router;
