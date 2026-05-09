import { offerBarRepository } from '@modules/offer-bar/repositories/offer-bar-repository.js';
import { AppError } from '@utils/app-error.js';
import { parsePagination, createPaginatedResult } from '@utils/pagination.js';
import { logger } from '@config/logger.js';

export interface CreateOfferBarInput {
  text: string;
  link?: string;
  order?: number;
  isActive?: boolean;
}

export class OfferBarService {
  async create(input: CreateOfferBarInput) {
    const offerBar = await offerBarRepository.create({
      text: input.text,
      link: input.link,
      order: input.order ?? 0,
      isActive: input.isActive ?? true,
    });
    logger.info(`OfferBar created: ${offerBar.id}`);
    return offerBar;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const { skip, take } = parsePagination({ page, limit }, 10, 100);
    const [offerBars, total] = await Promise.all([
      offerBarRepository.findMany({ skip, take, orderBy: { order: 'asc' } }),
      offerBarRepository.count(),
    ]);
    return createPaginatedResult(offerBars, total, page, take);
  }

  async findById(id: string) {
    const offerBar = await offerBarRepository.findById(id);
    if (!offerBar) throw AppError.notFound('OfferBar not found');
    return offerBar;
  }

  async update(id: string, input: Partial<CreateOfferBarInput>) {
    const offerBar = await offerBarRepository.findById(id);
    if (!offerBar) throw AppError.notFound('OfferBar not found');
    const updated = await offerBarRepository.update(id, input);
    logger.info(`OfferBar updated: ${id}`);
    return updated;
  }

  async delete(id: string) {
    const offerBar = await offerBarRepository.findById(id);
    if (!offerBar) throw AppError.notFound('OfferBar not found');
    await offerBarRepository.delete(id);
    logger.info(`OfferBar deleted: ${id}`);
  }
}

export const offerBarService = new OfferBarService();
