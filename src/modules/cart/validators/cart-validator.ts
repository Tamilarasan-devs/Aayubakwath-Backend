import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export const updateCartQuantitySchema = z.object({
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  couponCode: z.string().trim().min(3).max(32).optional(),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
});
