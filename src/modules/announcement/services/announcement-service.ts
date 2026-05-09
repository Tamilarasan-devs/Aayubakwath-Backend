import { announcementRepository } from '@modules/announcement/repositories/announcement-repository.js';
import { AppError } from '@utils/app-error.js';
import { parsePagination, createPaginatedResult } from '@utils/pagination.js';
import { logger } from '@config/logger.js';

export interface CreateAnnouncementInput {
  title: string;
  content?: string;
  isActive?: boolean;
}

export class AnnouncementService {
  async create(input: CreateAnnouncementInput) {
    const announcement = await announcementRepository.create({
      title: input.title,
      content: input.content ?? '',
      isActive: input.isActive ?? true,
    });
    logger.info(`Announcement created: ${announcement.id}`);
    return announcement;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const { skip, take } = parsePagination({ page, limit }, 10, 100);
    const [announcements, total] = await Promise.all([
      announcementRepository.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      announcementRepository.count(),
    ]);
    return createPaginatedResult(announcements, total, page, take);
  }

  async findById(id: string) {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) throw AppError.notFound('Announcement not found');
    return announcement;
  }

  async update(id: string, input: Partial<CreateAnnouncementInput>) {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) throw AppError.notFound('Announcement not found');
    const updated = await announcementRepository.update(id, input);
    logger.info(`Announcement updated: ${id}`);
    return updated;
  }

  async delete(id: string) {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) throw AppError.notFound('Announcement not found');
    await announcementRepository.delete(id);
    logger.info(`Announcement deleted: ${id}`);
  }
}

export const announcementService = new AnnouncementService();
