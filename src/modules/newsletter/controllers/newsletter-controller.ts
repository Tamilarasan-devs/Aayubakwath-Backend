import { Request, Response } from 'express';
import { newsletterService } from '@modules/newsletter/services/newsletter-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const subscriber = await newsletterService.subscribe(email, name);
  successResponse(res, subscriber, 'Successfully subscribed to newsletter', 201);
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await newsletterService.unsubscribe(email);
  successResponse(res, null, 'Successfully unsubscribed from newsletter');
});

export const getSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await newsletterService.getAllSubscribers(page, limit);
  successResponse(res, result.items, 'Newsletter subscribers retrieved', {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

export const deleteSubscriber = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await newsletterService.deleteSubscriber(id);
  successResponse(res, null, 'Subscriber deleted successfully');
});
