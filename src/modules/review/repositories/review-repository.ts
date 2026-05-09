import { prisma } from '@config/database.js';

export class ReviewRepository {
  async create(data: { userId: string; productId: string; rating: number; comment?: string }) {
    return prisma.review.create({ data });
  }

  async findByProductId(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserIdAndProductId(userId: string, productId: string) {
    return prisma.review.findFirst({
      where: { userId, productId },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.review.deleteMany({
      where: { id, userId },
    });
  }

  async getAggregate(productId: string) {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });
    const reviewCount = reviews.length;
    const rating = reviewCount > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
      : 0;
    return { rating, reviewCount };
  }
}

export const reviewRepository = new ReviewRepository();
