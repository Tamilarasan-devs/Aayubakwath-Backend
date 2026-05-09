import { orderRepository } from '@modules/order/repositories/order-repository.js';
import { cartRepository } from '@modules/cart/repositories/cart-repository.js';
import { productRepository } from '@modules/product/repositories/product-repository.js';
import { couponService } from '@modules/coupon/services/coupon-service.js';
import { AppError } from '@utils/app-error.js';
import { parsePagination, createPaginatedResult } from '@utils/pagination.js';
import { logger } from '@config/logger.js';

export interface CreateOrderInput {
  shippingAddress: Record<string, unknown>;
  couponCode?: string;
}

export class OrderService {
  async createOrder(userId: string, input: CreateOrderInput) {
    const cartItems = await cartRepository.findByUserId(userId);
    if (cartItems.length === 0) {
      throw AppError.badRequest('Cart is empty');
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const product = await productRepository.findById(cartItem.productId);
      if (!product) {
        throw AppError.notFound(`Product ${cartItem.productId} not found`);
      }

      const price = Number(product.finalPrice ?? product.price);
      totalAmount += price * cartItem.quantity;

      orderItems.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceAtPurchase: price,
      });
    }

    const couponResult = await couponService.applyForOrder(userId, input.couponCode);
    const subtotalAmount = totalAmount;
    const discountAmount = couponResult?.discountAmount ?? 0;
    totalAmount = Math.max(0, subtotalAmount - discountAmount);

    const order = await orderRepository.create({
      userId,
      couponId: couponResult?.couponId,
      couponCode: couponResult?.couponCode,
      subtotalAmount,
      discountAmount,
      totalAmount,
      shippingAddress: input.shippingAddress,
      items: {
        create: orderItems,
      },
    });

    if (couponResult && discountAmount > 0) {
      await couponService.recordUsage(userId, couponResult.couponId, order.id, discountAmount);
    }

    await cartRepository.clearCart(userId);

    logger.info(`Order created: ${order.id}`);
    return order;
  }

  async getOrdersByUserId(userId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = parsePagination({ page, limit }, 10, 100);
    const { orders, total } = await orderRepository.findByUserId(userId, skip, take);

    return createPaginatedResult(orders, total, page, take);
  }

  async getOrderById(id: string) {
    const order = await orderRepository.findByIdWithItems(id);
    if (!order) {
      throw AppError.notFound('Order not found');
    }
    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw AppError.notFound('Order not found');
    }

    return orderRepository.update(id, { status });
  }

  async getAllOrders() {
    const orders = await orderRepository.findMany({
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true, phoneNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders;
  }
}

export const orderService = new OrderService();
