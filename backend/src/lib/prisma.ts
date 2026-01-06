// backend/src/lib/prisma.ts
// ✅ FIXED: Added PG adapter for production connection pooling
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  // ✅ PRODUCTION: Use adapter for connection pooling (Fly.io free tier)
  if (process.env.NODE_ENV === 'production') {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is required in production');
    }

    // ✅ Connection pool optimized for 256MB RAM
    const pool = new Pool({
      connectionString,
      max: 3,                    // ✅ CRITICAL: Low pool size for free tier
      idleTimeoutMillis: 30000,  // 30 seconds
      connectionTimeoutMillis: 10000,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });
  }

  // ✅ DEVELOPMENT: Direct connection (no adapter needed)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});