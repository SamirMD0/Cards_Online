// backend/src/lib/prisma.ts - REPLACE lines 8-42
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is required in production');
    }

    // ✅ CRITICAL FIX: Add statement_timeout to connection string
    const url = new URL(connectionString);
    if (!url.searchParams.has('statement_timeout')) {
      url.searchParams.set('statement_timeout', '5000');
    }
    const urlWithTimeout = url.toString();

    const pool = new Pool({
      connectionString: urlWithTimeout,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });
  }

  // Development: direct connection
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});