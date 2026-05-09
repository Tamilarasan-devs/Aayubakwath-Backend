import { z } from 'zod';

export const createHomeBannerSchema = z.object({
  link: z.string().optional(),
  order: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const updateHomeBannerSchema = z.object({
  link: z.string().optional(),
  order: z.coerce.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const createOfferBannerSchema = z.object({
  link: z.string().optional(),
  order: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const updateOfferBannerSchema = z.object({
  link: z.string().optional(),
  order: z.coerce.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const createCategoryBannerSchema = z.object({
  link: z.string().optional(),
  order: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  categoryId: z.string().uuid(),
});

export const updateCategoryBannerSchema = z.object({
  link: z.string().optional(),
  order: z.coerce.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().uuid().optional(),
});
