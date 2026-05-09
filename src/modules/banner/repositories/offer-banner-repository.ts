import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { OfferBanner } from '@prisma/client';

export class OfferBannerRepository extends BaseRepository<OfferBanner> {
  constructor() {
    super(prisma.offerBanner);
  }
}

export const offerBannerRepository = new OfferBannerRepository();
