import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate, authorize } from './auth.js';
import { mockPrisma } from '../setup-tests.js';
import { AppError } from '@utils/app-error.js';
import { createMockUser, createMockAdmin, createMockModerator, generateToken } from '../test-utils.js';
import type { Request, Response } from 'express';

const createMockRequest = (overrides: any = {}) => ({
  headers: {},
  cookies: {},
  ...overrides,
});

const createMockResponse = () => ({}) as Response;

const createMockNext = () => {
  const next = vi.fn();
  return next;
};

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should call next with error when no token is provided', async () => {
      const req = createMockRequest() as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should authenticate user with valid Bearer token', async () => {
      const mockUser = createMockUser();
      const token = generateToken(mockUser.id);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      }) as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(next).toHaveBeenCalledWith();
      expect((req as any).user).toEqual(mockUser);
      expect((req as any).userId).toBe(mockUser.id);
    });

    it('should authenticate user with valid cookie token', async () => {
      const mockUser = createMockUser();
      const token = generateToken(mockUser.id);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const req = createMockRequest({
        cookies: { token },
      }) as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect((req as any).user).toEqual(mockUser);
    });

    it('should reject when user is not found', async () => {
      const token = generateToken('nonexistent');
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      }) as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid or expired token');
    });

    it('should reject when user is inactive', async () => {
      const mockUser = createMockUser({ isActive: false });
      const token = generateToken(mockUser.id);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      }) as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid or expired token');
    });

    it('should reject with invalid token', async () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer invalidtoken' },
      }) as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });

  describe('authorize', () => {
    it('should call next when user has required role', () => {
      const mockAdmin = createMockAdmin();
      const req = createMockRequest({ user: mockAdmin }) as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authorize('ADMIN')(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should call next when user has one of the required roles', () => {
      const mockModerator = createMockModerator();
      const req = createMockRequest({ user: mockModerator }) as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authorize('ADMIN', 'MODERATOR')(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should return 403 when user does not have required role', () => {
      const mockUser = createMockUser();
      const req = createMockRequest({ user: mockUser }) as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authorize('ADMIN')(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Insufficient permissions');
    });

    it('should return 401 when user is not authenticated', () => {
      const req = createMockRequest({ user: null }) as unknown as Request;
      const res = createMockResponse();
      const next = createMockNext();

      authorize('ADMIN')(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });
});
