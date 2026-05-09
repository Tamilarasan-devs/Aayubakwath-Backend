import { Router } from 'express';
import {
  createContactInquiry,
  createBulkOrder,
  getContactInquiries,
  getBulkOrders,
} from '@modules/inquiry/controllers/inquiry-controller.js';
import { validate } from '@middleware/validate.js';
import { createContactInquirySchema, createBulkOrderSchema } from '@modules/inquiry/validators/inquiry-validator.js';
import { authenticate, authorize } from '@middleware/auth.js';

const router = Router();

router.post('/contact', validate(createContactInquirySchema), createContactInquiry);
router.post('/bulk-order', validate(createBulkOrderSchema), createBulkOrder);

router.get('/contact', authenticate, authorize('ADMIN', 'MODERATOR'), getContactInquiries);
router.get('/bulk-order', authenticate, authorize('ADMIN', 'MODERATOR'), getBulkOrders);

export default router;
