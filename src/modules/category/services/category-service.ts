import { categoryRepository } from '@modules/category/repositories/category-repository.js';
import { uploadToCloudinary, deleteFromCloudinary } from '@utils/cloudinary.js';
import { AppError } from '@utils/app-error.js';
import { parsePagination, createPaginatedResult } from '@utils/pagination.js';
import { logger } from '@config/logger.js';
import type { FileUpload } from '@/types/index.js';

export interface CreateCategoryInput {
  name: string;
}

export class CategoryService {
  async create(input: CreateCategoryInput, file?: FileUpload) {
    let image: string | undefined;
    if (file) {
      const uploaded = await uploadToCloudinary(file, 'categories');
      image = uploaded.url;
    }

    const category = await categoryRepository.create({
      name: input.name,
      image,
    });

    logger.info(`Category created: ${category.id}`);
    return category;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const { skip, take } = parsePagination({ page, limit }, 10, 100);
    const categories = await categoryRepository.findMany({
      skip,
      take,
      orderBy: { name: 'asc' },
    });
    const total = await categoryRepository.count();
    return createPaginatedResult(categories, total, page, take);
  }

  async findById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw AppError.notFound('Category not found');
    }
    return category;
  }

  async update(id: string, input: { name?: string }, file?: FileUpload) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    let image = category.image;
    if (file) {
      if (image) {
        const publicId = image.split('/').pop()?.split('.')[0];
        if (publicId) await deleteFromCloudinary(publicId).catch(() => {});
      }
      const uploaded = await uploadToCloudinary(file, 'categories');
      image = uploaded.url;
    }

    const updated = await categoryRepository.update(id, {
      name: input.name ?? category.name,
      image,
    });

    logger.info(`Category updated: ${id}`);
    return updated;
  }

  async delete(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    if (category.image) {
      const publicId = category.image.split('/').pop()?.split('.')[0];
      if (publicId) await deleteFromCloudinary(publicId).catch(() => {});
    }

    await categoryRepository.delete(id);
    logger.info(`Category deleted: ${id}`);
  }
}

export const categoryService = new CategoryService();
