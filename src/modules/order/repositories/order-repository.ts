import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { Order } from '@prisma/client';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(prisma.order);
  }

  async findByUserId(userId: string, skip: number, take: number) {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return { orders, total };
  }

  async findByIdWithItems(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true, phoneNumber: true },
        },
      },
    });
  }
}

export const orderRepository = new OrderRepository();
