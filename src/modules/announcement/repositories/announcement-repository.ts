import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { Announcement } from '@prisma/client';

export class AnnouncementRepository extends BaseRepository<Announcement> {
  constructor() {
    super(prisma.announcement);
  }
}

export const announcementRepository = new AnnouncementRepository();
