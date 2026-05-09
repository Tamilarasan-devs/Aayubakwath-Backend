import jwt from 'jsonwebtoken';
import { prisma } from './config/database.js';
import { env } from './config/env.js';
import type { PrismaClient } from '@prisma/client';

export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  phoneNumber: '+1234567890',
  password: 'hashedpassword',
  role: 'USER',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockAdmin = (overrides = {}) =>
  createMockUser({ id: 'admin-123', role: 'ADMIN', ...overrides });

export const createMockModerator = (overrides = {}) =>
  createMockUser({ id: 'moderator-123', role: 'MODERATOR', ...overrides });

export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: '7d' });
};

export const getAuthHeaders = (role: 'ADMIN' | 'MODERATOR' | 'USER' = 'ADMIN') => {
  const userId = role === 'ADMIN' ? 'admin-123' : role === 'MODERATOR' ? 'moderator-123' : 'user-123';
  const token = generateToken(userId);
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const resetMockPrisma = () => {
  const mock = prisma as unknown as Record<string, { mockReset?: () => void }>;
  Object.keys(mock).forEach((key) => {
    const value = mock[key];
    if (value && typeof value === 'object' && 'mockReset' in value) {
      (value as any).mockReset();
    }
  });
};

export const getMockPrisma = () => prisma as unknown as PrismaClient;
