import { Response, Request } from 'express';
import type { AuthenticatedRequest } from '@/types/index.js';
import { couponService } from '@modules/coupon/services/coupon-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.create(req.body);
  successResponse(res, coupon, 'Coupon created successfully', 201);
});

export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await couponService.findAll(parseInt(page as string) || 1, parseInt(limit as string) || 20);
  successResponse(res, result.data, 'Coupons retrieved successfully', result.meta);
});

export const getCouponById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const coupon = await couponService.findById(id);
  successResponse(res, coupon, 'Coupon retrieved successfully');
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const coupon = await couponService.update(id, req.body);
  successResponse(res, coupon, 'Coupon updated successfully');
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await couponService.delete(id);
  successResponse(res, null, 'Coupon deleted successfully');
});

export const applyCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { code } = req.body as { code: string };
  const result = await couponService.applyForUser(req.userId!, code);
  successResponse(res, result, 'Coupon applied successfully');
});

export const getPublicCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await couponService.getPublicCoupons();
  successResponse(res, coupons, 'Public coupons retrieved successfully');
});

