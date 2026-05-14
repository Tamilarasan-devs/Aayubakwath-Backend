import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { env } from '@config/env.js';
import { logger } from '@config/logger.js';
import { AppError } from '@utils/app-error.js';
import { ApiErrorResponse } from '@utils/api-response.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err as any;

  if (!(error instanceof AppError)) {
    // Wrap it but keep the original message to help debugging
    const originalMessage = err.message || 'An unexpected error occurred';
    error = AppError.internal(originalMessage);
    logger.error('Unhandled error:', err);
  }

  if (error instanceof AppError && !error.isOperational) {
    logger.error('Non-operational error:', err);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    error = AppError.badRequest('Invalid request data');
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    error = AppError.internal('Database connection failed. Please ensure the database server is running.');
  }

  if (err instanceof ZodError) {
    error = AppError.badRequest('Validation failed', err.errors);
  }

  const response: ApiErrorResponse = {
    success: false,
    message: error.message,
  };

  if (env.NODE_ENV === 'development' && error instanceof AppError) {
    response.error = {
      stack: error.stack,
      details: error.details,
    };
  }

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  res.status(statusCode).json(response);
};

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      return AppError.conflict('A record with this value already exists');
    case 'P2025':
      return AppError.notFound('Record not found');
    case 'P2003':
      return AppError.badRequest('Invalid reference data');
    case 'P2014':
      return AppError.badRequest('Invalid relation data');
    default:
      return AppError.internal('Something went wrong. Please try again.');
  }
};

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(AppError.notFound(`Route ${_req.method} ${_req.originalUrl} not found`));
};
