import { Router } from 'express';
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  deleteSubscriber,
} from '@modules/newsletter/controllers/newsletter-controller.js';
import { authenticate, authorize } from '@middleware/auth.js';

const router = Router();

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/subscribers', authenticate, authorize('ADMIN'), getSubscribers);
router.delete('/subscribers/:id', authenticate, authorize('ADMIN'), deleteSubscriber);

export default router;
