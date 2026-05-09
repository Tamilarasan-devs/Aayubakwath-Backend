import { Request, Response } from 'express';
import { productService } from '@modules/product/services/product-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const product = await productService.create(req.body, files);

  successResponse(res, product, 'Product created successfully', 201);
});

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await productService.findAll(
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10
  );

  successResponse(res, result.data, 'Products retrieved successfully', result.meta);
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const product = await productService.findById(id);

  successResponse(res, product, 'Product retrieved successfully');
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const files = req.files as Express.Multer.File[] | undefined;
  const product = await productService.update(id, req.body, files);

  successResponse(res, product, 'Product updated successfully');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await productService.delete(id);

  successResponse(res, null, 'Product deleted successfully');
});

export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { q, page, limit } = req.query;
  const result = await productService.search(
    q as string,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10
  );

  successResponse(res, result.data, 'Products searched successfully', result.meta);
});
