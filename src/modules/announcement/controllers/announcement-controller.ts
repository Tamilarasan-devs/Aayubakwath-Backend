import { Request, Response } from 'express';
import { announcementService } from '@modules/announcement/services/announcement-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await announcementService.create(req.body);
  successResponse(res, announcement, 'Announcement created successfully');
});

export const getAllAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await announcementService.findAll(
    parseInt(page as string) || 1,
    parseInt(limit as string) || 10
  );
  successResponse(res, result.data, 'Announcements retrieved successfully', result.meta);
});

export const getAnnouncementById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const announcement = await announcementService.findById(id);
  successResponse(res, announcement, 'Announcement retrieved successfully');
});

export const updateAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const announcement = await announcementService.update(id, req.body);
  successResponse(res, announcement, 'Announcement updated successfully');
});

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await announcementService.delete(id);
  successResponse(res, null, 'Announcement deleted successfully');
});
