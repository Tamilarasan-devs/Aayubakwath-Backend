import { Request, Response } from 'express';
import { productContentService } from '@modules/product-content/services/product-content-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const createProductContent = asyncHandler(async (req: Request, res: Response) => {
  const content = await productContentService.create(req.body);
  successResponse(res, content, 'Product content created successfully', 201);
});

export const getAllProductContents = asyncHandler(async (req: Request, res: Response) => {
  const contents = await productContentService.findAll();
  successResponse(res, contents, 'Product contents retrieved successfully');
});

export const getProductContent = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params as { productId: string };
  const content = await productContentService.findByProductId(productId);
  successResponse(res, content, 'Product content retrieved successfully');
});

export const updateProductContent = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params as { productId: string };
  const content = await productContentService.update(productId, req.body);
  successResponse(res, content, 'Product content updated successfully');
});

export const deleteProductContent = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params as { productId: string };
  await productContentService.delete(productId);
  successResponse(res, null, 'Product content deleted successfully');
});
