import { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/index.js';
import { wishlistService } from '@modules/wishlist/services/wishlist-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const getWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const wishlist = await wishlistService.getWishlist(req.userId!);

  successResponse(res, wishlist, 'Wishlist retrieved successfully');
});

export const addToWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.body;
  const wishlistItem = await wishlistService.addToWishlist(req.userId!, productId);

  successResponse(res, wishlistItem, 'Added to wishlist successfully', 201);
});

export const removeFromWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params as { productId: string };
  await wishlistService.removeFromWishlist(req.userId!, productId);

  successResponse(res, null, 'Removed from wishlist successfully');
});
