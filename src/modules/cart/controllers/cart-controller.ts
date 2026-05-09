import { Response } from 'express';
import type { AuthenticatedRequest } from '@/types/index.js';
import { cartService } from '@modules/cart/services/cart-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const cart = await cartService.getCart(req.userId!);

  successResponse(res, cart, 'Cart retrieved successfully');
});

export const addToCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { productId, quantity } = req.body;
  const cartItem = await cartService.addToCart(req.userId!, productId, quantity);

  successResponse(res, cartItem, 'Added to cart successfully', 201);
});

export const updateQuantity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params as { productId: string };
  const { quantity } = req.body;
  const cartItem = await cartService.updateQuantity(req.userId!, productId, quantity);

  successResponse(res, cartItem, 'Cart item updated successfully');
});

export const removeFromCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params as { productId: string };
  await cartService.removeFromCart(req.userId!, productId);

  successResponse(res, null, 'Removed from cart successfully');
});

export const clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await cartService.clearCart(req.userId!);

  successResponse(res, null, 'Cart cleared successfully');
});

export const getTotalItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const total = await cartService.getTotalItems(req.userId!);

  successResponse(res, { total }, 'Total cart items retrieved');
});
