import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().min(10).max(15).optional().or(z.literal('')),
  password: z.string().min(8).max(128),
}).refine((data) => {
  if (!data.email && !data.phoneNumber) {
    return false;
  }
  return true;
}, {
  message: 'Email or phone number is required',
});

export const loginSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().min(10).max(15).optional().or(z.literal('')),
  password: z.string().min(1).max(128),
}).refine((data) => {
  if (!data.email && !data.phoneNumber) {
    return false;
  }
  return true;
}, {
  message: 'Email or phone number is required',
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const verifyOtpSchema = z.object({
  userId: z.string().uuid(),
  otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
});

export const resendOtpSchema = z.object({
  userId: z.string().uuid(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().min(10).max(15).optional().or(z.literal('')),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
  otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
  password: z.string().min(8).max(128),
});
