import { Response, NextFunction } from 'express';
import { addressService } from '../services/address-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';
import type { AuthenticatedRequest } from '@/types/index.js';

export const getAddresses = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  const addresses = await addressService.getAll(req.user!.id);
  successResponse(res, addresses, 'Addresses retrieved successfully');
});

export const createAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  const address = await addressService.create(req.user!.id, req.body);
  successResponse(res, address, 'Address added successfully', 201);
});

export const updateAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  const address = await addressService.update(req.user!.id, req.params['id'] as string, req.body);
  successResponse(res, address, 'Address updated successfully');
});

export const deleteAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  await addressService.delete(req.user!.id, req.params['id'] as string);
  successResponse(res, null, 'Address removed successfully');
});

export const setDefaultAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  const address = await addressService.setDefault(req.user!.id, req.params['id'] as string);
  successResponse(res, address, 'Default address updated');
});
