// backend/src/lib/redisClient.ts
// ✅ FIXED: Support both local Redis and Upstash (with TLS)

import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}

class RedisClient {
  private static instance: Redis;
  private static connectionAttempts = 0;
  private static readonly MAX_RETRIES = 3;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      // ✅ Detect if using Upstash (TLS required)
      const isUpstash = REDIS_URL!.includes('upstash.io');
      const useTLS = REDIS_URL!.startsWith('rediss://') || isUpstash;

      console.log(`[Redis] Connecting to ${isUpstash ? 'Upstash' : 'local'} (TLS: ${useTLS})`);

      RedisClient.instance = new Redis(REDIS_URL!, {
        // ✅ CRITICAL: Upstash settings
        maxRetriesPerRequest: 3,
        enableReadyCheck: false, // ✅ Upstash doesn't support INFO during handshake
        lazyConnect: false,
        
        // ✅ TLS configuration (required for Upstash)
        tls: useTLS ? {
          rejectUnauthorized: true, // Validate SSL certificate
        } : undefined,
        
        // ✅ Retry strategy
        retryStrategy: (times) => {
          if (times > RedisClient.MAX_RETRIES) {
            console.error(`❌ Redis connection failed after ${RedisClient.MAX_RETRIES} retries`);
            return null;
          }
          const delay = Math.min(times * 1000, 5000);
          console.warn(`⚠️ Redis retry attempt ${times} in ${delay}ms`);
          return delay;
        },

        // ✅ Timeouts
        connectTimeout: 10000,
        commandTimeout: 5000,
        keepAlive: 30000,
        
        // ✅ Don't queue if disconnected
        enableOfflineQueue: false,
      });

      // ✅ Event handlers
      RedisClient.instance.on('connect', () => {
        RedisClient.connectionAttempts = 0;
        console.log('✅ Redis connected successfully');
      });

      RedisClient.instance.on('ready', () => {
        console.log('✅ Redis ready for commands');
      });

      RedisClient.instance.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
        RedisClient.connectionAttempts++;
        
        if (RedisClient.connectionAttempts > RedisClient.MAX_RETRIES) {
          console.error('💥 Redis permanently failed. Persistence disabled.');
        }
      });

      RedisClient.instance.on('close', () => {
        console.warn('⚠️ Redis connection closed');
      });

      RedisClient.instance.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });
    }

    return RedisClient.instance;
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      console.log('✅ Redis disconnected gracefully');
    }
  }
}

export const redis = RedisClient.getInstance();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing Redis connection...');
  await RedisClient.disconnect();
});