import { Router } from 'express';
import {
  createOfferBanner,
  getAllOfferBanners,
  getOfferBannerById,
  updateOfferBanner,
  deleteOfferBanner,
  deleteAllOfferBanners,
} from '@modules/banner/controllers/banner-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { uploadSingle } from '@middleware/upload.js';
import { createOfferBannerSchema, updateOfferBannerSchema } from '@modules/banner/validators/banner-validator.js';
import { idParamSchema } from '@modules/product/validators/product-validator.js';

const router = Router();

router.get('/', getAllOfferBanners);

router.delete(
  '/bulk',
  authenticate,
  authorize('ADMIN'),
  deleteAllOfferBanners
);

router.get('/:id', validate(idParamSchema, 'params'), getOfferBannerById);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  uploadSingle('image'),
  validate(createOfferBannerSchema),
  createOfferBanner
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(idParamSchema, 'params'),
  uploadSingle('image'),
  validate(updateOfferBannerSchema),
  updateOfferBanner
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  deleteOfferBanner
);

export default router;
