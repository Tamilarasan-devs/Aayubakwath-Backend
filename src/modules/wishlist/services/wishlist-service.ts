import { wishlistRepository } from '@modules/wishlist/repositories/wishlist-repository.js';
import { productRepository } from '@modules/product/repositories/product-repository.js';
import { AppError } from '@utils/app-error.js';
import { logger } from '@config/logger.js';

export class WishlistService {
  async getWishlist(userId: string) {
    return wishlistRepository.findByUserId(userId);
  }

  async addToWishlist(userId: string, productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    const existingItem = await wishlistRepository.findByUserIdAndProductId(userId, productId);
    if (existingItem) {
      throw AppError.conflict('Product already in wishlist');
    }

    const wishlistItem = await wishlistRepository.create({
      userId,
      productId,
    });

    logger.info(`Added to wishlist: ${wishlistItem.id}`);
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, productId: string) {
    const wishlistItem = await wishlistRepository.findByUserIdAndProductId(userId, productId);
    if (!wishlistItem) {
      throw AppError.notFound('Wishlist item not found');
    }

    await wishlistRepository.delete(wishlistItem.id);
    logger.info(`Removed from wishlist: ${wishlistItem.id}`);
  }
}

export const wishlistService = new WishlistService();
