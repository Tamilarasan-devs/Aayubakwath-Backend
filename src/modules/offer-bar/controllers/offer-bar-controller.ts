import { Request, Response } from 'express';
import { offerBarService } from '@modules/offer-bar/services/offer-bar-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const createOfferBar = asyncHandler(async (req: Request, res: Response) => {
  const offerBar = await offerBarService.create(req.body);
  successResponse(res, offerBar, 'Offer bar created successfully', 201);
});

export const getAllOfferBars = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await offerBarService.findAll(
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10
  );
  successResponse(res, result.data, 'Offer bars retrieved successfully', result.meta);
});

export const getOfferBarById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const offerBar = await offerBarService.findById(id);
  successResponse(res, offerBar, 'Offer bar retrieved successfully');
});

export const updateOfferBar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const offerBar = await offerBarService.update(id, req.body);
  successResponse(res, offerBar, 'Offer bar updated successfully');
});

export const deleteOfferBar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await offerBarService.delete(id);
  successResponse(res, null, 'Offer bar deleted successfully');
});
