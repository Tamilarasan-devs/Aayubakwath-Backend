import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { CategoryBanner } from '@prisma/client';

export class CategoryBannerRepository extends BaseRepository<CategoryBanner> {
  constructor() {
    super(prisma.categoryBanner);
  }
}

export const categoryBannerRepository = new CategoryBannerRepository();
