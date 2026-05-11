import { prisma } from '@config/database.js';

export class NewsletterRepository {
  async subscribe(email: string, name?: string) {
    // Upsert: re-activates a previously unsubscribed address
    return prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, name: name ?? undefined },
      create: { email, name, isActive: true },
    });
  }

  async unsubscribe(email: string) {
    return prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false },
    });
  }

  async getAll(page: number, limit: number, activeOnly = false) {
    const skip = (page - 1) * limit;
    const where = activeOnly ? { isActive: true } : {};
    const [items, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async deleteById(id: string) {
    return prisma.newsletterSubscriber.delete({ where: { id } });
  }
}

export const newsletterRepository = new NewsletterRepository();
