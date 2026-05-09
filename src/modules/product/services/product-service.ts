import { productRepository } from '@modules/product/repositories/product-repository.js';
import { categoryRepository } from '@modules/category/repositories/category-repository.js';
import { uploadToCloudinary, deleteFromCloudinary } from '@utils/cloudinary.js';
import { AppError } from '@utils/app-error.js';
import { parsePagination, createPaginatedResult } from '@utils/pagination.js';
import { logger } from '@config/logger.js';
import type { FileUpload } from '@/types/index.js';
import type { CloudinaryUploadResult } from '@utils/cloudinary.js';

export interface CreateProductInput {
  productName: string;
  productDescription?: string;
  productTags?: string[];
  offerTags?: string[];
  forWhom?: string;
  withWhom?: string;
  price: number;
  finalPrice?: number;
  priceTiers?: any[];
  categoryId: string;
  grabCode?: string;
  grabPrice?: number;
}

export interface UpdateProductInput {
  productName?: string;
  productDescription?: string;
  productTags?: string[];
  offerTags?: string[];
  forWhom?: string;
  withWhom?: string;
  price?: number;
  finalPrice?: number;
  priceTiers?: any[];
  categoryId?: string;
  grabCode?: string;
  grabPrice?: number;
  existingImages?: CloudinaryUploadResult[];
}

export class ProductService {
  async create(input: CreateProductInput, files?: FileUpload[]): Promise<any> {
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    let productImages: CloudinaryUploadResult[] = [];
    if (files && files.length > 0) {
      productImages = await Promise.all(
        files.map((file) => uploadToCloudinary(file, 'products'))
      );
    }

    // Handle data parsing for FormData inputs
    let productTags = input.productTags;
    if (typeof productTags === 'string') {
      productTags = productTags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    let offerTags = input.offerTags;
    if (typeof offerTags === 'string') {
      offerTags = offerTags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    let priceTiers = input.priceTiers;
    if (typeof priceTiers === 'string') {
      try {
        priceTiers = JSON.parse(priceTiers);
      } catch (e) {
        priceTiers = [];
      }
    }

    const product = await productRepository.create({
      productName: input.productName,
      productDescription: input.productDescription,
      productTags: productTags ?? [],
      offerTags: offerTags,
      forWhom: input.forWhom ?? 'Not specified',
      withWhom: input.withWhom ?? 'Not specified',
      price: Number(input.price),
      finalPrice: input.finalPrice ? Number(input.finalPrice) : Number(input.price),
      priceTiers: priceTiers ?? [],
      categoryId: input.categoryId,
      grabCode: input.grabCode,
      grabPrice: input.grabPrice ? Number(input.grabPrice) : undefined,
      productImages,
    });

    logger.info(`Product created: ${product.id}`);
    return product;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const { skip, take } = parsePagination({ page, limit }, 10, 100);
    const { products, total } = await productRepository.findAllWithCategory(skip, take);

    return createPaginatedResult(products, total, page, take);
  }

  async findById(id: string) {
    const product = await productRepository.findByIdWithRelations(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }
    return product;
  }

  async update(id: string, input: any, files?: FileUpload[]): Promise<any> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (input.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw AppError.notFound('Category not found');
      }
    }

    // Handle data parsing for FormData inputs
    let existingImages = input.existingImages;
    if (typeof existingImages === 'string') {
      try {
        existingImages = JSON.parse(existingImages);
      } catch (e) {
        logger.error('Failed to parse existingImages', e);
        existingImages = [];
      }
    }

    let priceTiers = input.priceTiers;
    if (typeof priceTiers === 'string') {
      try {
        priceTiers = JSON.parse(priceTiers);
      } catch (e) {
        logger.error('Failed to parse priceTiers', e);
        priceTiers = [];
      }
    }

    let productTags = input.productTags;
    if (typeof productTags === 'string') {
      productTags = productTags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    let offerTags = input.offerTags;
    if (typeof offerTags === 'string') {
      offerTags = offerTags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    // Determine final images: use provided existingImages (which might be empty) 
    // or fallback to current product images if existingImages was not provided at all
    let productImages = (existingImages !== undefined ? existingImages : (product.productImages ?? [])) as any[];
    
    if (files && files.length > 0) {
      const newImages = await Promise.all(
        files.map((file) => uploadToCloudinary(file, 'products'))
      );
      productImages = [...productImages, ...newImages];
    }

    const updatedProduct = await productRepository.update(id, {
      productName: input.productName ?? product.productName,
      productDescription: input.productDescription ?? product.productDescription,
      productTags: productTags ?? product.productTags,
      offerTags: offerTags ?? product.offerTags,
      forWhom: input.forWhom ?? product.forWhom,
      withWhom: input.withWhom ?? product.withWhom,
      price: input.price ? Number(input.price) : product.price,
      finalPrice: input.finalPrice ? Number(input.finalPrice) : product.finalPrice,
      priceTiers: priceTiers ?? product.priceTiers,
      categoryId: input.categoryId ?? product.categoryId,
      grabCode: input.grabCode ?? product.grabCode,
      grabPrice: input.grabPrice ? Number(input.grabPrice) : product.grabPrice,
      productImages,
    });

    logger.info(`Product updated: ${id}`);
    return updatedProduct;
  }

  async delete(id: string): Promise<void> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    const images = product.productImages as any;
    if (images && Array.isArray(images) && images.length > 0) {
      await Promise.all(
        images.map((img: any) => deleteFromCloudinary(img.publicId).catch(() => {}))
      );
    }

    await productRepository.delete(id);
    logger.info(`Product deleted: ${id}`);
  }

  async findByCategoryId(categoryId: string, page: number = 1, limit: number = 10) {
    const { skip, take } = parsePagination({ page, limit }, 10, 100);
    const { products, total } = await productRepository.findByCategoryId(categoryId, skip, take);

    return createPaginatedResult(products, total, page, take);
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const { skip, take } = parsePagination({ page, limit }, 10, 100);
    const { products, total } = await productRepository.search(query, skip, take);

    return createPaginatedResult(products, total, page, take);
  }
}

export const productService = new ProductService();
