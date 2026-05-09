import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000).optional(),
  isActive: z.boolean().default(true),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(5000).optional(),
  isActive: z.boolean().optional(),
});
