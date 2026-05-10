import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { authService } from '@modules/auth/services/auth-service.js';
import { successResponse } from '@utils/api-response.js';
import { asyncHandler } from '@utils/async-handler.js';
import { prisma } from '@config/database.js';
import type { AuthenticatedRequest } from '@/types/index.js';

export const register = asyncHandler(async (req: ExpressRequest, res: Response, _next: NextFunction) => {
  const result = await authService.register(req.body);
  successResponse(res, result, result.message, 201);
});

export const verifyOtp = asyncHandler(async (req: ExpressRequest, res: Response, _next: NextFunction) => {
  const result = await authService.verifyOtp(req.body.userId, req.body.otp);
  successResponse(res, result, 'Email verified successfully');
});

export const resendOtp = asyncHandler(async (req: ExpressRequest, res: Response, _next: NextFunction) => {
  await authService.resendOtp(req.body.userId);
  successResponse(res, null, 'Verification code resent');
});

export const login = asyncHandler(async (req: ExpressRequest, res: Response, _next: NextFunction) => {
  const result = await authService.login(req.body);
  successResponse(res, result, 'Login successful');
});

export const refreshToken = asyncHandler(async (req: ExpressRequest, res: Response, _next: NextFunction) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  successResponse(res, result, 'Token refreshed successfully');
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  const { id, name, email, phoneNumber, role, createdAt } = req.user!;
  const addresses = await prisma.address.findMany({
    where: { userId: id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  successResponse(res, { id, name, email, phoneNumber, role, createdAt, addresses }, 'Profile retrieved successfully');
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
  const { id } = req.user!;
  const { name, phoneNumber } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name,
      phoneNumber,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      createdAt: true,
    },
  });

  successResponse(res, updatedUser, 'Profile updated successfully');
});
