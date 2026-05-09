import { v2 as cloudinary } from 'cloudinary';
import { env } from '@config/env.js';
import { logger } from '@config/logger.js';
import { AppError } from '@utils/app-error.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export const uploadToCloudinary = async (
  file: { buffer: Buffer; mimetype: string; size: number },
  folder: string = 'uploads'
): Promise<CloudinaryUploadResult> => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw AppError.badRequest('Invalid file type. Only images are allowed');
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw AppError.badRequest('File size exceeds 10MB limit');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
        transformation: [
          { width: 1920, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed:', error);
          reject(AppError.internal('Failed to upload file'));
          return;
        }
        if (!result) {
          reject(AppError.internal('Upload failed'));
          return;
        }

        logger.info(`File uploaded to Cloudinary: ${result.public_id}`);
        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`File deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error('Cloudinary delete failed:', error);
    throw AppError.internal('Failed to delete file');
  }
};

export const getCloudinaryUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' },
    ],
  });
};

export default cloudinary;
