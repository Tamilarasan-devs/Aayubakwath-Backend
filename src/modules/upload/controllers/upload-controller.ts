import { Request, Response } from 'express';
import { uploadToCloudinary } from '@utils/cloudinary.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';
import { AppError } from '@utils/app-error.js';

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  
  if (!file) {
    throw AppError.badRequest('No file uploaded');
  }

  const result = await uploadToCloudinary(file, 'general');

  successResponse(res, {
    url: result.secureUrl || result.url,
    publicId: result.publicId
  }, 'File uploaded successfully');
});
