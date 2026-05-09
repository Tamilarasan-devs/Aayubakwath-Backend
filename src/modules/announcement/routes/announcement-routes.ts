import { Router } from 'express';
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from '@modules/announcement/controllers/announcement-controller.js';
import { validate } from '@middleware/validate.js';
import { authenticate, authorize } from '@middleware/auth.js';
import { createAnnouncementSchema, updateAnnouncementSchema } from '@modules/announcement/validators/announcement-validator.js';
import { idParamSchema } from '@modules/product/validators/product-validator.js';

const router = Router();

router.get('/', getAllAnnouncements);
router.get('/:id', validate(idParamSchema, 'params'), getAnnouncementById);
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(createAnnouncementSchema),
  createAnnouncement
);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MODERATOR'),
  validate(idParamSchema, 'params'),
  validate(updateAnnouncementSchema),
  updateAnnouncement
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  deleteAnnouncement
);

export default router;
