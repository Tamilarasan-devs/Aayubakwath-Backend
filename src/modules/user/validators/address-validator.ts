import { z } from 'zod';

export const createAddressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  doorNumber: z.string().min(1, 'Door / Flat number is required').max(50),
  area: z.string().min(2, 'Area / Locality is required').max(200),
  landmark: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  postalCode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  addressType: z.enum(['Home', 'Work', 'Other']).default('Home'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
