import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { CartItem } from '@prisma/client';

export class CartRepository extends BaseRepository<CartItem> {
  constructor() {
    super(prisma.cartItem);
  }

  async findByUserId(userId: string) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async findByUserIdAndProductId(userId: string, productId: string) {
    return prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async clearCart(userId: string) {
    return prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  async getTotalItems(userId: string): Promise<number> {
    const result = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  }
}

export const cartRepository = new CartRepository();
