import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { Product } from '@prisma/client';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(prisma.product);
  }

  async findAllWithCategory(skip: number, take: number) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        include: {
          category: true,
          reviews: {
            select: { rating: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        where: { isActive: true },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    const productsWithRatings = products.map((product) => {
      const reviews = product.reviews as { rating: number }[];
      const reviewCount = reviews.length;
      const rating = reviewCount > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
        : 0;
      const { reviews: _, ...rest } = product;
      return { ...rest, rating, reviewCount };
    });

    return { products: productsWithRatings, total };
  }

  async findByIdWithRelations(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        content: true,
        reviews: {
          select: { rating: true },
        },
      },
    });

    if (!product) return null;

    const reviews = product.reviews as { rating: number }[];
    const reviewCount = reviews.length;
    const rating = reviewCount > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0;
    const { reviews: _, ...rest } = product;
    return { ...rest, rating, reviewCount };
  }

  async findByCategoryId(categoryId: string, skip: number, take: number) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId, isActive: true },
        include: {
          category: true,
          reviews: {
            select: { rating: true },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: { categoryId, isActive: true } }),
    ]);

    const productsWithRatings = products.map((product) => {
      const reviews = product.reviews as { rating: number }[];
      const reviewCount = reviews.length;
      const rating = reviewCount > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
        : 0;
      const { reviews: _, ...rest } = product;
      return { ...rest, rating, reviewCount };
    });

    return { products: productsWithRatings, total };
  }

  async search(query: string, skip: number, take: number) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { productName: { contains: query, mode: 'insensitive' } },
            { productDescription: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
          reviews: {
            select: { rating: true },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({
        where: {
          isActive: true,
          OR: [
            { productName: { contains: query, mode: 'insensitive' } },
            { productDescription: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const productsWithRatings = products.map((product) => {
      const reviews = product.reviews as { rating: number }[];
      const reviewCount = reviews.length;
      const rating = reviewCount > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
        : 0;
      const { reviews: _, ...rest } = product;
      return { ...rest, rating, reviewCount };
    });

    return { products: productsWithRatings, total };
  }
}

export const productRepository = new ProductRepository();
