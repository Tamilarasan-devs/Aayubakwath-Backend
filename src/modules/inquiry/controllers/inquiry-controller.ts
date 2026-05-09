import { Request, Response } from 'express';
import { inquiryService } from '@modules/inquiry/services/inquiry-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const createContactInquiry = asyncHandler(async (req: Request, res: Response) => {
  const inquiry = await inquiryService.createContactInquiry(req.body);
  successResponse(res, inquiry, 'Message sent successfully', 201);
});

export const createBulkOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await inquiryService.createBulkOrder(req.body);
  successResponse(res, order, 'Bulk order enquiry sent successfully', 201);
});

export const getContactInquiries = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await inquiryService.getContactInquiries(page, limit);
  successResponse(res, result.items, 'Contact inquiries retrieved', {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

export const getBulkOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await inquiryService.getBulkOrders(page, limit);
  successResponse(res, result.items, 'Bulk orders retrieved', {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});
