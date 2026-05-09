import { Request, Response } from 'express';
import { reviewService } from '@modules/review/services/review-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const review = await reviewService.create(userId, req.body);
  successResponse(res, review, 'Review submitted successfully', 201);
});

export const getReviewsByProduct = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const reviews = await reviewService.getByProductId(productId);
  successResponse(res, reviews, 'Reviews retrieved successfully');
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const id = req.params.id as string;
  await reviewService.delete(id, userId);
  successResponse(res, null, 'Review deleted successfully');
});

export const getProductReviewAggregate = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.productId as string;
  const aggregate = await reviewService.getAggregate(productId);
  successResponse(res, aggregate, 'Review aggregate retrieved successfully');
});
