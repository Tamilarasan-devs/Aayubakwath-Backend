import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';

export class CouponRepository extends BaseRepository<any> {
  constructor() {
    super((prisma as any).coupon);
  }

  async findByCode(code: string) {
    return (prisma as any).coupon.findUnique({ where: { code } });
  }

  async getUsageCount(couponId: string) {
    return (prisma as any).couponUsage.count({ where: { couponId } });
  }

  async getUserUsageCount(couponId: string, userId: string) {
    return (prisma as any).couponUsage.count({ where: { couponId, userId } });
  }

  async findAllActive() {
    const now = new Date();
    return (prisma as any).coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
      },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderAmount: true,
        maxDiscountAmount: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const couponRepository = new CouponRepository();
