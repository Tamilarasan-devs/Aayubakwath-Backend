import { Router } from 'express';
import {
  createReview,
  getReviewsByProduct,
  deleteReview,
  getProductReviewAggregate,
} from '@modules/review/controllers/review-controller.js';
import { authenticate } from '@middleware/auth.js';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/product/:productId', getReviewsByProduct);
router.get('/product/:productId/aggregate', getProductReviewAggregate);
router.delete('/:id', authenticate, deleteReview);

export default router;
