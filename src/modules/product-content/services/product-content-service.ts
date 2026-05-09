import { productContentRepository } from '@modules/product-content/repositories/product-content-repository.js';
import { productRepository } from '@modules/product/repositories/product-repository.js';
import { AppError } from '@utils/app-error.js';
import { logger } from '@config/logger.js';

export interface CreateProductContentInput {
  content: Record<string, unknown>;
  productId: string;
}

export class ProductContentService {
  async create(input: CreateProductContentInput) {
    const product = await productRepository.findById(input.productId);
    if (!product) throw AppError.notFound('Product not found');

    const existing = await productContentRepository.findByProductId(input.productId);
    
    if (existing) {
      const updated = await productContentRepository.update(existing.id, {
        content: input.content as any,
      });
      logger.info(`ProductContent updated via create (upsert): ${existing.id}`);
      return updated;
    }

    const content = await productContentRepository.create({
      content: input.content as any,
      productId: input.productId,
    });

    logger.info(`ProductContent created: ${content.id}`);
    return content;
  }

  async findByProductId(productId: string) {
    const content = await productContentRepository.findByProductId(productId);
    if (!content) throw AppError.notFound('Product content not found');
    return content;
  }

  async update(productId: string, input: { content: Record<string, unknown> }) {
    const existing = await productContentRepository.findByProductId(productId);
    if (!existing) throw AppError.notFound('Product content not found');

    const updated = await productContentRepository.update(existing.id, {
      content: input.content,
    });

    logger.info(`ProductContent updated: ${existing.id}`);
    return updated;
  }

  async findAll() {
    return productContentRepository.findAll();
  }

  async delete(productId: string) {
    const existing = await productContentRepository.findByProductId(productId);
    if (!existing) throw AppError.notFound('Product content not found');
    await productContentRepository.delete(existing.id);
    logger.info(`ProductContent deleted: ${existing.id}`);
  }
}

export const productContentService = new ProductContentService();
