import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { AppError } from '@utils/app-error.js';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req[source]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error, {
          prefixSeparator: ' ',
          prefix: '',
        });
        return next(AppError.badRequest(validationError.message, error.errors));
      }
      next(error);
    }
  };
};
