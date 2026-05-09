import { Router } from 'express';
import { uploadImage } from '@modules/upload/controllers/upload-controller.js';
import { authenticate } from '@middleware/auth.js';
import { uploadSingle } from '@middleware/upload.js';

const router = Router();

router.post('/image', authenticate, uploadSingle('image'), uploadImage);

export default router;
