import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { logger } from './config/logger.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import v1Routes from './routes/v1/index.js';
import { env } from './config/env.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  app.use(compression());

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());


  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  });

  app.use(rateLimiter);

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'Server is healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
    });
  });

  app.get('/ready', (_req, res) => {
    res.json({ success: true, message: 'Server is ready' });
  });

  app.use('/api/v1', v1Routes);

  app.all('{*path}', notFoundHandler);

  app.use(errorHandler);

  return app;
};
