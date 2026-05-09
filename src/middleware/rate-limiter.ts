import rateLimit from 'express-rate-limit';
import { env } from '@config/env.js';
import { logger } from '@config/logger.js';

export const rateLimiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    logger.warn('Rate limit exceeded');
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
