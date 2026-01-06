import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}

// Singleton Redis client
class RedisClient {
  private static instance: Redis;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(REDIS_URL!, {
        maxRetriesPerRequest: null, // Allow retry for all requests
        retryStrategy: (times) => {
          // Retry for up to ~30 seconds (conservative for cold starts)
          if (times > 20) {
            console.error('❌ Redis connection failed after 20 retries');
            return null; // Stop retrying
          }

          const delay = Math.min(times * 200, 3000); // Exponential backoff up to 3s
          console.warn(`⚠️ Redis retry attempt ${times} in ${delay}ms`);
          return delay;
        }
      });

      RedisClient.instance.on('connect', () => {
        console.log('✅ Redis connected');
      });

      RedisClient.instance.on('error', (err) => {
        console.error('❌ Redis error:', err);
      });

      RedisClient.instance.on('close', () => {
        console.warn('⚠️ Redis connection closed');
      });
    }

    return RedisClient.instance;
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
    }
  }
}

export const redis = RedisClient.getInstance();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing Redis connection...');
  await RedisClient.disconnect();
});