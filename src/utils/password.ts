import bcrypt from 'bcrypt';
import { env } from '@config/env.js';
import { AppError } from '@utils/app-error.js';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(env.BCRYPT_ROUNDS);
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const validatePasswordStrength = (password: string): void => {
  if (password.length < 8) {
    throw AppError.badRequest('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw AppError.badRequest('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    throw AppError.badRequest('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw AppError.badRequest('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw AppError.badRequest('Password must contain at least one special character');
  }
};
