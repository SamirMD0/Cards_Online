// backend/src/routes/health.routes.ts
import express from 'express';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redisClient.js';

const router = express.Router();

/**
 * Basic health check - always returns 200 if server is running
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Database health check
 */
router.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Health] Database check failed:', error);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Redis health check
 */
router.get('/health/redis', async (_req, res) => {
  try {
    const result = await redis.ping();
    if (result !== 'PONG') {
      throw new Error('Redis ping failed');
    }
    res.json({
      status: 'ok',
      redis: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Health] Redis check failed:', error);
    res.status(503).json({
      status: 'error',
      redis: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Comprehensive readiness check (all systems)
 */
router.get('/health/ready', async (_req, res) => {
  const checks = {
    server: false,
    database: false,
    redis: false,
  };

  let overallStatus = 'ok';

  // Server check
  checks.server = true;

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    overallStatus = 'degraded';
    console.error('[Health] Database not ready:', error);
  }

  // Redis check
  try {
    const result = await redis.ping();
    checks.redis = result === 'PONG';
    if (!checks.redis) {
      overallStatus = 'degraded';
    }
  } catch (error) {
    overallStatus = 'degraded';
    console.error('[Health] Redis not ready:', error);
  }

  const statusCode = overallStatus === 'ok' ? 200 : 503;

  res.status(statusCode).json({
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Liveness check (for Kubernetes-style orchestrators)
 */
router.get('/health/live', (_req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export default router;

// In server.ts, add:
// import healthRoutes from './routes/health.routes.js';
// app.use(healthRoutes);