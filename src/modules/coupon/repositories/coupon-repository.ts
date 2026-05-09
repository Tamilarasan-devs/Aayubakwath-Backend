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
}

export const couponRepository = new CouponRepository();
