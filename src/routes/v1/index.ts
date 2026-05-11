import { Router } from 'express';
import announcementRoutes from '@modules/announcement/routes/announcement-routes.js';
import analyticsRoutes from '@modules/analytics/routes/analytics-routes.js';
import authRoutes from '@modules/auth/routes/auth-routes.js';
import homeBannerRoutes from '@modules/banner/routes/home-banner-routes.js';
import offerBannerRoutes from '@modules/banner/routes/offer-banner-routes.js';
import categoryBannerRoutes from '@modules/banner/routes/category-banner-routes.js';
import cartRoutes from '@modules/cart/routes/cart-routes.js';
import categoryRoutes from '@modules/category/routes/category-routes.js';
import couponRoutes from '@modules/coupon/routes/coupon-routes.js';
import inquiryRoutes from '@modules/inquiry/routes/inquiry-routes.js';
import offerBarRoutes from '@modules/offer-bar/routes/offer-bar-routes.js';
import orderRoutes from '@modules/order/routes/order-routes.js';
import productRoutes from '@modules/product/routes/product-routes.js';
import productContentRoutes from '@modules/product-content/routes/product-content-routes.js';
import reviewRoutes from '@modules/review/routes/review-routes.js';
import userRoutes from '@modules/user/routes/user-routes.js';
import wishlistRoutes from '@modules/wishlist/routes/wishlist-routes.js';
import uploadRoutes from '@modules/upload/routes/upload-routes.js';
import newsletterRoutes from '@modules/newsletter/routes/newsletter-routes.js';



const router = Router();

console.log('Mounting /auth routes...');
router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/categories', categoryRoutes);
router.use('/announcements', announcementRoutes);
router.use('/home-banners', homeBannerRoutes);
router.use('/offer-banners', offerBannerRoutes);
router.use('/category-banners', categoryBannerRoutes);
router.use('/offer-bars', offerBarRoutes);
router.use('/product-contents', productContentRoutes);
console.log('Mounting /users routes...');
router.use('/users', userRoutes);
console.log('/users routes mounted.');
router.use('/analytics', analyticsRoutes);
router.use('/reviews', reviewRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/coupons', couponRoutes);
router.use('/newsletter', newsletterRoutes);


export default router;
