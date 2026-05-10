import { Router } from 'express';
import { authenticate, authorize } from '@middleware/auth.js';
import { validate } from '@middleware/validate.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';
import { prisma } from '@config/database.js';
import { getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/address-controller.js';
import { updateProfile } from '@modules/auth/controllers/auth-controller.js';
import { createAddressSchema, updateAddressSchema } from '../validators/address-validator.js';
import { updateProfileSchema } from '@modules/auth/validators/auth-validator.js';

const router = Router();

router.use(authenticate);

// Profile route
router.patch('/profile', validate(updateProfileSchema), updateProfile);

// Admin — list all users
router.get(
  '/admin/all',
  authorize('ADMIN', 'MODERATOR'),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    successResponse(res, users, 'All users retrieved successfully');
  })
);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', validate(createAddressSchema), createAddress);
router.patch('/addresses/:id', validate(updateAddressSchema), updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.patch('/addresses/:id/default', setDefaultAddress);

export default router;
