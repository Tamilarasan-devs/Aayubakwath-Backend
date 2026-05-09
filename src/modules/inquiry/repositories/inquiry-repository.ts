import { prisma } from '@config/database.js';
import { Prisma } from '@prisma/client';
import { logger } from '@config/logger.js';

export class InquiryRepository {
  async createContactInquiry(data: { name: string; email: string; phone?: string; message: string; source?: string }) {
    return prisma.contactInquiry.create({ data });
  }

  async createBulkOrder(data: {
    name: string;
    email: string;
    mobile: string;
    state: string;
    productQuantity: string;
    totalQuantity: string;
    details?: string;
    source?: string;
  }) {
    return prisma.bulkOrder.create({ data });
  }

  async getContactInquiries(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactInquiry.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getBulkOrders(page: number, limit: number) {
    const skip = (page - 1) * limit;
    try {
      const [items, total] = await Promise.all([
        prisma.bulkOrder.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.bulkOrder.count(),
      ]);
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      // Some environments may temporarily run with older DB schema.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
        logger.warn('bulk_orders table is missing in current database; returning empty result for admin list.');
        return { items: [], total: 0, page, limit, totalPages: 1 };
      }
      throw error;
    }
  }
}

export const inquiryRepository = new InquiryRepository();
