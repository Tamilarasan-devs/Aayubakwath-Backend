import { z } from 'zod';

export const createProductContentSchema = z.object({
  content: z.record(z.unknown()),
  productId: z.string().uuid(),
});

export const updateProductContentSchema = z.object({
  content: z.record(z.unknown()).optional(),
});
