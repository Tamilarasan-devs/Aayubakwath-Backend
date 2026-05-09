import { reviewRepository } from '@modules/review/repositories/review-repository.js';
import { productRepository } from '@modules/product/repositories/product-repository.js';
import { AppError } from '@utils/app-error.js';
import { logger } from '@config/logger.js';

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment?: string;
}

export class ReviewService {
  async create(userId: string, input: CreateReviewInput) {
    const product = await productRepository.findById(input.productId);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    const existing = await reviewRepository.findByUserIdAndProductId(userId, input.productId);
    if (existing) {
      throw new AppError('You have already reviewed this product', 400);
    }

    if (input.rating < 1 || input.rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const review = await reviewRepository.create({
      userId,
      productId: input.productId,
      rating: input.rating,
      comment: input.comment,
    });

    logger.info(`Review created for product ${input.productId} by user ${userId}`);
    return review;
  }

  async getByProductId(productId: string) {
    return reviewRepository.findByProductId(productId);
  }

  async delete(reviewId: string, userId: string) {
    const result = await reviewRepository.delete(reviewId, userId);
    if (result.count === 0) {
      throw AppError.notFound('Review not found or unauthorized');
    }
    logger.info(`Review deleted: ${reviewId}`);
  }

  async getAggregate(productId: string) {
    return reviewRepository.getAggregate(productId);
  }
}

export const reviewService = new ReviewService();
