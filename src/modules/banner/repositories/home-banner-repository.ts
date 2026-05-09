import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { HomeBanner } from '@prisma/client';

export class HomeBannerRepository extends BaseRepository<HomeBanner> {
  constructor() {
    super(prisma.homeBanner);
  }
}

export const homeBannerRepository = new HomeBannerRepository();
