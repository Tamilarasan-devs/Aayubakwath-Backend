import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { Category } from '@prisma/client';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(prisma.category);
  }

  async findAllWithProducts(skip: number, take: number) {
    return prisma.category.findMany({
      skip,
      take,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const categoryRepository = new CategoryRepository();
