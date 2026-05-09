import { Router } from 'express';
import {
  getKPIs,
  getRevenueOverTime,
  getRevenueByCategory,
  getTopProducts,
  getOrderStatusDistribution,
  getOrdersOverTime,
  getUserGrowth,
  getUserRoleDistribution,
  getUserOrderFrequency,
  getCartStats,
  getWishlistStats,
  getCategoryPerformance,
  getFulfillmentMetrics,
  getRecentActivity,
  getLowPerformingProducts,
} from '@modules/analytics/controllers/analytics-controller.js';
import { authenticate, authorize } from '@middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'MODERATOR'));

router.get('/kpis', getKPIs);
router.get('/revenue-over-time', getRevenueOverTime);
router.get('/revenue-by-category', getRevenueByCategory);
router.get('/top-products', getTopProducts);
router.get('/order-status', getOrderStatusDistribution);
router.get('/orders-over-time', getOrdersOverTime);
router.get('/user-growth', getUserGrowth);
router.get('/user-roles', getUserRoleDistribution);
router.get('/user-frequency', getUserOrderFrequency);
router.get('/cart-stats', getCartStats);
router.get('/wishlist-stats', getWishlistStats);
router.get('/category-performance', getCategoryPerformance);
router.get('/fulfillment', getFulfillmentMetrics);
router.get('/recent-activity', getRecentActivity);
router.get('/low-performing-products', getLowPerformingProducts);

export default router;
