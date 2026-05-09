import { z } from 'zod';

const discountTypeSchema = z.enum(['PERCENT', 'FIXED']);

export const createCouponSchema = z.object({
  code: z.string().trim().min(3).max(32).transform((v) => v.toUpperCase()),
  description: z.string().trim().max(300).optional(),
  discountType: discountTypeSchema,
  discountValue: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  perUserLimit: z.coerce.number().int().positive().optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.coerce.boolean().optional(),
  applicableProductIds: z.array(z.string().uuid()).optional(),
  applicableCategoryIds: z.array(z.string().uuid()).optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const applyCouponSchema = z.object({
  code: z.string().trim().min(3).max(32).transform((v) => v.toUpperCase()),
});

