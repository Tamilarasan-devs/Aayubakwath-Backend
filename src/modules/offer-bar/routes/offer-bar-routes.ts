import { Router } from 'express';
import {
  createOfferBar,
  getAllOfferBars,
  getOfferBarById,
  updateOfferBar,
  deleteOfferBar,
} from '@modules/offer-bar/controllers/offer-bar-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { createOfferBarSchema, updateOfferBarSchema } from '@modules/offer-bar/validators/offer-bar-validator.js';
import { idParamSchema } from '@modules/product/validators/product-validator.js';

const router = Router();

router.get('/', getAllOfferBars);
router.get('/:id', validate(idParamSchema, 'params'), getOfferBarById);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(createOfferBarSchema),
  createOfferBar
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(idParamSchema, 'params'),
  validate(updateOfferBarSchema),
  updateOfferBar
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  deleteOfferBar
);

export default router;
