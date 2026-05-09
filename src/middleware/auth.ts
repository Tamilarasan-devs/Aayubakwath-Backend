import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '@config/database.js';
import { env } from '@config/env.js';
import { logger } from '@config/logger.js';
import { AppError } from '@utils/app-error.js';
import { AuthenticatedRequest } from '@/types/index.js';

interface JwtPayload {
  id: string;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(AppError.unauthorized('Authentication required'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      return next(AppError.unauthorized('Invalid or expired token'));
    }

    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).userId = user.id;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized('Token expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(AppError.unauthorized('Invalid token'));
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      return next(AppError.unauthorized('Invalid or expired token'));
    }
    logger.error('Authentication error:', error);
    next(AppError.internal('Authentication failed'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authenticatedReq = req as AuthenticatedRequest;
    if (!authenticatedReq.user) {
      return next(AppError.unauthorized());
    }

    if (!roles.includes(authenticatedReq.user.role)) {
      return next(AppError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  const cookieToken = (req as any).cookies?.token;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (user && user.isActive) {
      (req as AuthenticatedRequest).user = user;
      (req as AuthenticatedRequest).userId = user.id;
    }
  } catch (error) {
    logger.debug('Optional auth failed:', error);
  }
  next();
};
