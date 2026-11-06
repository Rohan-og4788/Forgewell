import { PrismaClient } from '@prisma/client';
import { logger } from './logger.ts';

import { env } from '../config/env.ts';

declare global {
  // eslint-disable-next-line no-var
  var __forgewell_prisma: PrismaClient | undefined;
}

const accelerateUrl =
  env.DATABASE_URL && env.DATABASE_URL.startsWith('prisma://')
    ? env.DATABASE_URL
    : `prisma://accelerate.prisma-data.net/?api_key=default`;

export const prisma =
  globalThis.__forgewell_prisma ??
  new PrismaClient({
    accelerateUrl,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__forgewell_prisma = prisma;
}

// Log queries in debug mode
// @ts-expect-error Prisma event typing
prisma.$on('query', (e: { query: string; duration: number }) => {
  logger.debug(`Prisma query executed`, { duration: `${e.duration}ms`, query: e.query });
});

// @ts-expect-error Prisma event typing
prisma.$on('error', (e: { message: string }) => {
  logger.error(`Prisma error: ${e.message}`);
});

// Graceful disconnection
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
