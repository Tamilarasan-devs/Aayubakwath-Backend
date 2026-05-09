import { Request, Response } from 'express';
import { categoryService } from '@modules/category/services/category-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const category = await categoryService.create(req.body, file);
  successResponse(res, category, 'Category created successfully', 201);
});

export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await categoryService.findAll(
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10
  );
  successResponse(res, result.data, 'Categories retrieved successfully', result.meta);
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const category = await categoryService.findById(id);
  successResponse(res, category, 'Category retrieved successfully');
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const file = req.file as Express.Multer.File | undefined;
  const category = await categoryService.update(id, req.body, file);
  successResponse(res, category, 'Category updated successfully');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await categoryService.delete(id);
  successResponse(res, null, 'Category deleted successfully');
});
