import { z } from 'zod';

export const createOfferBarSchema = z.object({
  text: z.string().min(1).max(500),
  link: z.string().optional(),
  order: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const updateOfferBarSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  link: z.string().optional(),
  order: z.coerce.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});
