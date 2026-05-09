import { prisma } from '@config/database.js';
import { couponRepository } from '@modules/coupon/repositories/coupon-repository.js';
import { cartRepository } from '@modules/cart/repositories/cart-repository.js';
import { productRepository } from '@modules/product/repositories/product-repository.js';
import { AppError } from '@utils/app-error.js';
import { parsePagination, createPaginatedResult } from '@utils/pagination.js';

interface CouponApplyResult {
  couponId: string;
  couponCode: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
}

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v));
    } catch {
      return t.split(',').map((v) => v.trim()).filter(Boolean);
    }
  }
  return [];
};

export class CouponService {
  async create(input: any) {
    const existing = await couponRepository.findByCode(input.code);
    if (existing) throw AppError.conflict('Coupon code already exists');

    return couponRepository.create({
      ...input,
      applicableProductIds: input.applicableProductIds ?? null,
      applicableCategoryIds: input.applicableCategoryIds ?? null,
    });
  }

  async findAll(page = 1, limit = 20) {
    const { skip, take } = parsePagination({ page, limit }, 20, 100);
    const [data, total] = await Promise.all([
      couponRepository.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      couponRepository.count(),
    ]);
    return createPaginatedResult(data, total, page, take);
  }

  async findById(id: string) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw AppError.notFound('Coupon not found');
    return coupon;
  }

  async update(id: string, input: any) {
    const current = await couponRepository.findById(id);
    if (!current) throw AppError.notFound('Coupon not found');

    if (input.code && input.code !== current.code) {
      const codeTaken = await couponRepository.findByCode(input.code);
      if (codeTaken) throw AppError.conflict('Coupon code already exists');
    }

    return couponRepository.update(id, input);
  }

  async delete(id: string) {
    const current = await couponRepository.findById(id);
    if (!current) throw AppError.notFound('Coupon not found');
    return couponRepository.delete(id);
  }

  private async evaluateCoupon(userId: string, code: string): Promise<CouponApplyResult> {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || !coupon.isActive) throw AppError.badRequest('Invalid or inactive coupon');

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      throw AppError.badRequest('Coupon is not active yet');
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      throw AppError.badRequest('Coupon has expired');
    }

    const [totalUsage, userUsage, cartItems] = await Promise.all([
      couponRepository.getUsageCount(coupon.id),
      couponRepository.getUserUsageCount(coupon.id, userId),
      cartRepository.findByUserId(userId),
    ]);

    if (coupon.usageLimit && totalUsage >= coupon.usageLimit) {
      throw AppError.badRequest('Coupon usage limit reached');
    }
    if (coupon.perUserLimit && userUsage >= coupon.perUserLimit) {
      throw AppError.badRequest('You have already used this coupon the maximum number of times');
    }
    if (cartItems.length === 0) throw AppError.badRequest('Cart is empty');

    let subtotal = 0;
    const applicableProductIds = new Set(toStringArray(coupon.applicableProductIds));
    const applicableCategoryIds = new Set(toStringArray(coupon.applicableCategoryIds));

    for (const item of cartItems) {
      const product = await productRepository.findById(item.productId);
      if (!product) continue;

      const productAmount = Number(product.finalPrice ?? product.price) * item.quantity;
      const scopedByProduct = applicableProductIds.size > 0;
      const scopedByCategory = applicableCategoryIds.size > 0;

      const includeByProduct = !scopedByProduct || applicableProductIds.has(product.id);
      const includeByCategory = !scopedByCategory || applicableCategoryIds.has(product.categoryId);
      if (includeByProduct && includeByCategory) {
        subtotal += productAmount;
      }
    }

    if (subtotal <= 0) throw AppError.badRequest('Coupon is not applicable to current cart items');
    if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
      throw AppError.badRequest(`Minimum order amount is ₹${Number(coupon.minOrderAmount).toFixed(2)}`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENT') {
      discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
    }
    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

    return {
      couponId: coupon.id,
      couponCode: coupon.code,
      subtotal,
      discountAmount,
      totalAmount: subtotal - discountAmount,
    };
  }

  async applyForUser(userId: string, code: string) {
    return this.evaluateCoupon(userId, code);
  }

  async applyForOrder(userId: string, code?: string | null) {
    if (!code) return null;
    return this.evaluateCoupon(userId, code.toUpperCase());
  }

  async recordUsage(userId: string, couponId: string, orderId: string, discountAmount: number) {
    return (prisma as any).couponUsage.create({
      data: {
        userId,
        couponId,
        orderId,
        discountAmount,
      },
    });
  }
}

export const couponService = new CouponService();
