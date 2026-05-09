import { prisma } from '@config/database.js';
import { BaseRepository } from '@shared/repositories/base-repository.js';
import type { OfferBar } from '@prisma/client';

export class OfferBarRepository extends BaseRepository<OfferBar> {
  constructor() {
    super(prisma.offerBar);
  }
}

export const offerBarRepository = new OfferBarRepository();
