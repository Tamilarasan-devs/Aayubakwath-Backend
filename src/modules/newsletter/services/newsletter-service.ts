import { newsletterRepository } from '@modules/newsletter/repositories/newsletter-repository.js';
import { logger } from '@config/logger.js';

export class NewsletterService {
  async subscribe(email: string, name?: string) {
    const sanitizedEmail = email.toLowerCase().trim();
    const subscriber = await newsletterRepository.subscribe(sanitizedEmail, name);
    logger.info(`Newsletter subscription: ${sanitizedEmail}`);
    return subscriber;
  }

  async unsubscribe(email: string) {
    const sanitizedEmail = email.toLowerCase().trim();
    const subscriber = await newsletterRepository.unsubscribe(sanitizedEmail);
    logger.info(`Newsletter unsubscription: ${sanitizedEmail}`);
    return subscriber;
  }

  async getAllSubscribers(page: number, limit: number) {
    return newsletterRepository.getAll(page, limit);
  }

  async deleteSubscriber(id: string) {
    return newsletterRepository.deleteById(id);
  }
}

export const newsletterService = new NewsletterService();
