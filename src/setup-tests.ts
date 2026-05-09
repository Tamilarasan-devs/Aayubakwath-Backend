import { vi } from 'vitest';

const createMockPrismaModel = () => ({
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  upsert: vi.fn(),
  createMany: vi.fn(),
  updateMany: vi.fn(),
  deleteMany: vi.fn(),
});

const mockPrisma = {
  $connect: vi.fn().mockResolvedValue(undefined),
  $disconnect: vi.fn().mockResolvedValue(undefined),
  $transaction: vi.fn().mockImplementation(async (fn) => fn(mockPrisma)),
  user: createMockPrismaModel(),
  product: createMockPrismaModel(),
  category: createMockPrismaModel(),
  announcement: createMockPrismaModel(),
  homeBanner: createMockPrismaModel(),
  offerBanner: createMockPrismaModel(),
  categoryBanner: createMockPrismaModel(),
  offerBar: createMockPrismaModel(),
  productContent: createMockPrismaModel(),
  order: createMockPrismaModel(),
  orderItem: createMockPrismaModel(),
  cartItem: createMockPrismaModel(),
  wishlist: createMockPrismaModel(),
  address: createMockPrismaModel(),
};

vi.mock('./config/database.js', () => ({
  prisma: mockPrisma,
  default: mockPrisma,
}));

vi.mock('@config/database.js', () => ({
  prisma: mockPrisma,
  default: mockPrisma,
}));

vi.mock('./config/env.js', () => {
  const mockEnv = {
    NODE_ENV: 'test' as const,
    PORT: '3001',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-jwt-secret-key-that-is-at-least-32-characters-long',
    JWT_EXPIRES_IN: '7d',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-that-is-at-least-32-characters',
    JWT_REFRESH_EXPIRES_IN: '30d',
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_API_KEY: 'test-key',
    CLOUDINARY_API_SECRET: 'test-secret',
    CLOUDINARY_FOLDER: 'test-uploads',
    CORS_ORIGINS: 'https://4aayubakawath-production.up.railway.app',
    RATE_LIMIT_WINDOW_MS: '900000',
    RATE_LIMIT_MAX_REQUESTS: '100',
    LOG_LEVEL: 'error' as const,
    BCRYPT_ROUNDS: '12',
  };
  return { env: mockEnv };
});

vi.mock('@config/env.js', () => {
  const mockEnv = {
    NODE_ENV: 'test' as const,
    PORT: '3001',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-jwt-secret-key-that-is-at-least-32-characters-long',
    JWT_EXPIRES_IN: '7d',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-that-is-at-least-32-characters',
    JWT_REFRESH_EXPIRES_IN: '30d',
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_API_KEY: 'test-key',
    CLOUDINARY_API_SECRET: 'test-secret',
    CLOUDINARY_FOLDER: 'test-uploads',
    CORS_ORIGINS: 'https://4aayubakawath-production.up.railway.app',
    RATE_LIMIT_WINDOW_MS: '900000',
    RATE_LIMIT_MAX_REQUESTS: '100',
    LOG_LEVEL: 'error' as const,
    BCRYPT_ROUNDS: '12',
  };
  return { env: mockEnv };
});

vi.mock('./config/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@config/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('./middleware/upload.js', () => ({
  uploadSingle: (_fieldName: string) => (_req: any, _res: any, next: any) => next(),
  uploadMultiple: (_fieldName: string, _maxCount: number) => (_req: any, _res: any, next: any) => next(),
}));

vi.mock('@middleware/upload.js', () => ({
  uploadSingle: (_fieldName: string) => (_req: any, _res: any, next: any) => next(),
  uploadMultiple: (_fieldName: string, _maxCount: number) => (_req: any, _res: any, next: any) => next(),
}));

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/test-image.jpg' }),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-email-id' }, error: null }),
    },
  })),
}));

export { mockPrisma };
