import { z } from 'zod';

export const createContactInquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Message is required').max(2000),
});

export const createBulkOrderSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address'),
  mobile: z.string().trim().min(1, 'Mobile is required').max(20),
  state: z.string().trim().min(1, 'State is required').max(100),
  productQuantity: z.string().trim().min(1, 'Product/Quantity is required').max(200),
  totalQuantity: z.string().trim().min(1, 'Total quantity is required').max(100),
  details: z.string().trim().max(2000).optional().or(z.literal('')),
});
