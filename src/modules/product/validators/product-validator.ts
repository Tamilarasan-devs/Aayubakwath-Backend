import { z } from 'zod';

export const priceTierSchema = z.object({
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  finalPrice: z.coerce.number().positive().optional(),
  label: z.string().optional(),
});

const stringOrArray = (transform?: (v: string) => string[]) =>
  z.union([
    z.array(z.string()),
    z.string().transform((val) => (transform ? transform(val) : val ? [val] : [])),
  ]);

const jsonOrArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([
    schema,
    z.string().transform((val) => (val ? JSON.parse(val) : [])),
  ]);

export const createProductSchema = z.object({
  productName: z.string().min(1).max(200),
  productDescription: z.string().max(5000).optional(),
  productTags: stringOrArray((val) => val.split(',').map((s) => s.trim()).filter(Boolean)).optional(),
  offerTags: stringOrArray((val) => val.split(',').map((s) => s.trim()).filter(Boolean)).optional(),
  forWhom: z.string().optional(),
  withWhom: z.string().optional(),
  price: z.coerce.number().positive(),
  finalPrice: z.coerce.number().positive().optional(),
  priceTiers: jsonOrArray(z.array(priceTierSchema)).optional(),
  categoryId: z.string().uuid(),
  grabCode: z.string().optional(),
  grabPrice: z.coerce.number().positive().optional(),
});

export const updateProductSchema = z.object({
  productName: z.string().min(1).max(200).optional(),
  productDescription: z.string().max(5000).optional(),
  productTags: stringOrArray((val) => val.split(',').map((s) => s.trim()).filter(Boolean)).optional(),
  offerTags: stringOrArray((val) => val.split(',').map((s) => s.trim()).filter(Boolean)).optional(),
  forWhom: z.string().optional(),
  withWhom: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  finalPrice: z.coerce.number().positive().optional(),
  priceTiers: jsonOrArray(z.array(priceTierSchema)).optional(),
  categoryId: z.string().uuid().optional(),
  grabCode: z.string().optional(),
  grabPrice: z.coerce.number().positive().optional(),
  existingImages: jsonOrArray(z.array(z.object({
    publicId: z.string().optional(),
    url: z.string().url(),
    secureUrl: z.string().url().optional(),
  }))).optional(),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
