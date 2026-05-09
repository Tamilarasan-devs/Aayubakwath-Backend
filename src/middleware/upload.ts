import multer from 'multer';
import { AppError } from '@utils/app-error.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new AppError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed', 400));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
});

export const uploadSingle = (fieldName: string = 'image') => {
  return upload.single(fieldName);
};

export const uploadMultiple = (fieldName: string = 'images', maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

export const uploadFields = (fields: { name: string; maxCount?: number }[]) => {
  return upload.fields(fields);
};
