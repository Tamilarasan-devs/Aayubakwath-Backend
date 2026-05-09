import { Router } from 'express';
import {
  createHomeBanner,
  getAllHomeBanners,
  getHomeBannerById,
  updateHomeBanner,
  deleteHomeBanner,
  deleteAllHomeBanners,
} from '@modules/banner/controllers/banner-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { uploadSingle } from '@middleware/upload.js';
import { createHomeBannerSchema, updateHomeBannerSchema } from '@modules/banner/validators/banner-validator.js';
import { idParamSchema } from '@modules/product/validators/product-validator.js';

const router = Router();

router.get('/', getAllHomeBanners);

router.delete(
  '/bulk',
  authenticate,
  authorize('ADMIN'),
  deleteAllHomeBanners
);

router.get('/:id', validate(idParamSchema, 'params'), getHomeBannerById);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  uploadSingle('image'),
  validate(createHomeBannerSchema),
  createHomeBanner
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(idParamSchema, 'params'),
  uploadSingle('image'),
  validate(updateHomeBannerSchema),
  updateHomeBanner
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  deleteHomeBanner
);

export default router;
