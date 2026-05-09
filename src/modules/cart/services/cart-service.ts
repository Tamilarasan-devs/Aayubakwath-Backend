import { cartRepository } from '@modules/cart/repositories/cart-repository.js';
import { productRepository } from '@modules/product/repositories/product-repository.js';
import { AppError } from '@utils/app-error.js';
import { logger } from '@config/logger.js';

export class CartService {
  async getCart(userId: string) {
    return cartRepository.findByUserId(userId);
  }

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    const existingItem = await cartRepository.findByUserIdAndProductId(userId, productId);
    if (existingItem) {
      return cartRepository.update(existingItem.id, {
        quantity: existingItem.quantity + quantity,
      });
    }

    const cartItem = await cartRepository.create({
      userId,
      productId,
      quantity,
    });

    logger.info(`Added to cart: ${cartItem.id}`);
    return cartItem;
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    if (quantity < 1) {
      throw AppError.badRequest('Quantity must be at least 1');
    }

    const cartItem = await cartRepository.findByUserIdAndProductId(userId, productId);
    if (!cartItem) {
      throw AppError.notFound('Cart item not found');
    }

    return cartRepository.update(cartItem.id, { quantity });
  }

  async removeFromCart(userId: string, productId: string) {
    const cartItem = await cartRepository.findByUserIdAndProductId(userId, productId);
    if (!cartItem) {
      throw AppError.notFound('Cart item not found');
    }

    await cartRepository.delete(cartItem.id);
    logger.info(`Removed from cart: ${cartItem.id}`);
  }

  async clearCart(userId: string) {
    return cartRepository.clearCart(userId);
  }

  async getTotalItems(userId: string): Promise<number> {
    return cartRepository.getTotalItems(userId);
  }
}

export const cartService = new CartService();
