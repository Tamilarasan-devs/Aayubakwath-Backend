import { Request, Response } from 'express';
import { homeBannerService, offerBannerService, categoryBannerService } from '@modules/banner/services/banner-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

const createBannerHandler = (service: any, name: string) =>
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File | undefined;
    const banner = await service.create(req.body, file);
    successResponse(res, banner, `${name} created successfully`, 201);
  });

const getAllBannersHandler = (service: any, name: string) =>
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const result = await service.findAll(
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10
    );
    successResponse(res, result.data, `${name} retrieved successfully`, result.meta);
  });

const getBannerByIdHandler = (service: any, name: string) =>
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const banner = await service.findById(id);
    successResponse(res, banner, `${name} retrieved successfully`);
  });

const updateBannerHandler = (service: any, name: string) =>
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const file = req.file as Express.Multer.File | undefined;
    const banner = await service.update(id, req.body, file);
    successResponse(res, banner, `${name} updated successfully`);
  });

const deleteBannerHandler = (service: any, name: string) =>
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await service.delete(id);
    successResponse(res, null, `${name} deleted successfully`);
  });

const deleteAllBannersHandler = (service: any, name: string) =>
  asyncHandler(async (req: Request, res: Response) => {
    await service.deleteAll();
    successResponse(res, null, `All ${name}s deleted successfully`);
  });

export const createHomeBanner = createBannerHandler(homeBannerService, 'Home banner');
export const getAllHomeBanners = getAllBannersHandler(homeBannerService, 'Home banners');
export const getHomeBannerById = getBannerByIdHandler(homeBannerService, 'Home banner');
export const updateHomeBanner = updateBannerHandler(homeBannerService, 'Home banner');
export const deleteHomeBanner = deleteBannerHandler(homeBannerService, 'Home banner');
export const deleteAllHomeBanners = deleteAllBannersHandler(homeBannerService, 'Home banner');

export const createOfferBanner = createBannerHandler(offerBannerService, 'Offer banner');
export const getAllOfferBanners = getAllBannersHandler(offerBannerService, 'Offer banners');
export const getOfferBannerById = getBannerByIdHandler(offerBannerService, 'Offer banner');
export const updateOfferBanner = updateBannerHandler(offerBannerService, 'Offer banner');
export const deleteOfferBanner = deleteBannerHandler(offerBannerService, 'Offer banner');
export const deleteAllOfferBanners = deleteAllBannersHandler(offerBannerService, 'Offer banner');

export const createCategoryBanner = createBannerHandler(categoryBannerService, 'Category banner');
export const getAllCategoryBanners = getAllBannersHandler(categoryBannerService, 'Category banners');
export const getCategoryBannerById = getBannerByIdHandler(categoryBannerService, 'Category banner');
export const updateCategoryBanner = updateBannerHandler(categoryBannerService, 'Category banner');
export const deleteCategoryBanner = deleteBannerHandler(categoryBannerService, 'Category banner');
export const deleteAllCategoryBanners = deleteAllBannersHandler(categoryBannerService, 'Category banner');
