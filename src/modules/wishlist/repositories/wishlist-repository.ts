import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { Wishlist } from '@prisma/client';

export class WishlistRepository extends BaseRepository<Wishlist> {
  constructor() {
    super(prisma.wishlist);
  }

  async findByUserId(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async findByUserIdAndProductId(userId: string, productId: string) {
    return prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }
}

export const wishlistRepository = new WishlistRepository();
