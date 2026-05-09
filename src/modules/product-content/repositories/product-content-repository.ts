import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { ProductContent } from '@prisma/client';

export class ProductContentRepository extends BaseRepository<ProductContent> {
  constructor() {
    super(prisma.productContent);
  }

  async findByProductId(productId: string) {
    return prisma.productContent.findUnique({
      where: { productId },
      include: { product: true },
    });
  }

  async findAll() {
    return prisma.productContent.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const productContentRepository = new ProductContentRepository();
