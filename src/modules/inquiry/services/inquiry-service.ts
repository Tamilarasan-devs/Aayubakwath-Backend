import { inquiryRepository } from '@modules/inquiry/repositories/inquiry-repository.js';
import { logger } from '@config/logger.js';

export interface CreateContactInquiryInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface CreateBulkOrderInput {
  name: string;
  email: string;
  mobile: string;
  state: string;
  productQuantity: string;
  totalQuantity: string;
  details?: string;
}

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').trim();

export class InquiryService {
  async createContactInquiry(input: CreateContactInquiryInput) {
    const sanitized = {
      name: sanitize(input.name),
      email: input.email.toLowerCase().trim(),
      phone: input.phone ? sanitize(input.phone) : undefined,
      message: sanitize(input.message),
      source: 'website',
    };

    const inquiry = await inquiryRepository.createContactInquiry(sanitized);
    logger.info(`Contact inquiry created: ${inquiry.id} from ${sanitized.email}`);
    return inquiry;
  }

  async createBulkOrder(input: CreateBulkOrderInput) {
    const sanitized = {
      name: sanitize(input.name),
      email: input.email.toLowerCase().trim(),
      mobile: sanitize(input.mobile),
      state: sanitize(input.state),
      productQuantity: sanitize(input.productQuantity),
      totalQuantity: sanitize(input.totalQuantity),
      details: input.details ? sanitize(input.details) : undefined,
      source: 'website',
    };

    const order = await inquiryRepository.createBulkOrder(sanitized);
    logger.info(`Bulk order inquiry created: ${order.id} from ${sanitized.email}`);
    return order;
  }

  async getContactInquiries(page: number, limit: number) {
    return inquiryRepository.getContactInquiries(page, limit);
  }

  async getBulkOrders(page: number, limit: number) {
    return inquiryRepository.getBulkOrders(page, limit);
  }
}

export const inquiryService = new InquiryService();
