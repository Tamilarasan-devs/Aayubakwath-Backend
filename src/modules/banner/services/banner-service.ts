import { homeBannerRepository } from '@modules/banner/repositories/home-banner-repository.js';
import { offerBannerRepository } from '@modules/banner/repositories/offer-banner-repository.js';
import { categoryBannerRepository } from '@modules/banner/repositories/category-banner-repository.js';
import { uploadToCloudinary, deleteFromCloudinary } from '@utils/cloudinary.js';
import { AppError } from '@utils/app-error.js';
import { parsePagination, createPaginatedResult } from '@utils/pagination.js';
import { logger } from '@config/logger.js';
import type { FileUpload } from '@/types/index.js';

interface CreateBannerInput {
  link?: string;
  order?: number;
  isActive?: boolean;
  categoryId?: string;
}

class BannerService {
  private repository: any;
  private folder: string;

  constructor(repository: any, folder: string) {
    this.repository = repository;
    this.folder = folder;
  }

  async create(input: CreateBannerInput, file?: FileUpload) {
    let image: string | undefined;
    if (file) {
      const uploaded = await uploadToCloudinary(file, this.folder);
      image = uploaded.secureUrl;
    }

    const banner = await this.repository.create({
      image,
      link: input.link,
      order: input.order ?? 0,
      isActive: input.isActive ?? true,
      ...(input.categoryId && { categoryId: input.categoryId }),
    });

    logger.info(`${this.folder} banner created: ${banner.id}`);
    return banner;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const { skip, take } = parsePagination({ page, limit }, 10, 100);
    const [banners, total] = await Promise.all([
      this.repository.findMany({ skip, take, orderBy: { order: 'asc' } }),
      this.repository.count(),
    ]);
    return createPaginatedResult(banners, total, page, take);
  }

  async findById(id: string) {
    const banner = await this.repository.findById(id);
    if (!banner) throw AppError.notFound('Banner not found');
    return banner;
  }

  async update(id: string, input: Partial<CreateBannerInput>, file?: FileUpload) {
    const banner = await this.repository.findById(id);
    if (!banner) throw AppError.notFound('Banner not found');

    let image = banner.image;
    if (file) {
      if (image) {
        const publicId = image.split('/').pop()?.split('.')[0];
        if (publicId) await deleteFromCloudinary(publicId).catch(() => {});
      }
      const uploaded = await uploadToCloudinary(file, this.folder);
      image = uploaded.secureUrl;
    }

    const updated = await this.repository.update(id, {
      image,
      link: input.link ?? banner.link,
      order: input.order ?? banner.order,
      isActive: input.isActive ?? banner.isActive,
      ...(input.categoryId && { categoryId: input.categoryId }),
    });

    logger.info(`${this.folder} banner updated: ${id}`);
    return updated;
  }

  async delete(id: string) {
    const banner = await this.repository.findById(id);
    if (!banner) throw AppError.notFound('Banner not found');

    if (banner.image) {
      try {
        const parts = banner.image.split('/upload/');
        if (parts.length > 1) {
          const publicIdWithVersion = parts[1];
          const publicId = publicIdWithVersion.split('/').slice(1).join('/').split('.')[0];
          
          if (publicId) {
            logger.info(`Deleting image from Cloudinary: ${publicId}`);
            await deleteFromCloudinary(publicId).catch((err) => {
              logger.error(`Cloudinary deletion failed for ${publicId}:`, err);
            });
          }
        }
      } catch (err) {
        logger.error('Error parsing publicId from banner image:', err);
      }
    }

    await this.repository.delete(id);
    logger.info(`${this.folder} banner deleted: ${id}`);
  }

  async deleteAll() {
    const banners = await this.repository.findMany();
    
    // Delete images from Cloudinary
    await Promise.all(
      banners.map(async (banner: any) => {
        if (banner.image) {
          try {
            const parts = banner.image.split('/upload/');
            if (parts.length > 1) {
              const publicIdWithVersion = parts[1];
              const publicId = publicIdWithVersion.split('/').slice(1).join('/').split('.')[0];
              if (publicId) {
                await deleteFromCloudinary(publicId).catch(() => {});
              }
            }
          } catch (err) {
            // Ignore errors for bulk delete
          }
        }
      })
    );

    // Delete all from DB
    await this.repository.model.deleteMany();
    logger.info(`All ${this.folder} banners deleted`);
  }
}

export const homeBannerService = new BannerService(homeBannerRepository, 'home-banners');
export const offerBannerService = new BannerService(offerBannerRepository, 'offer-banners');
export const categoryBannerService = new BannerService(categoryBannerRepository, 'category-banners');
