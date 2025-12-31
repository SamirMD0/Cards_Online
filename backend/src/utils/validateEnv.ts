// backend/src/utils/validateEnv.ts (NEW FILE)
import { logger } from '../lib/logger.js';

export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'REDIS_URL',
    'CLIENT_URL',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET!.length < 32) {
    console.error('❌ FATAL: JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }

  // Validate URLs
  try {
    new URL(process.env.DATABASE_URL!);
    new URL(process.env.REDIS_URL!);
    new URL(process.env.CLIENT_URL!);
  } catch (error) {
    console.error('❌ FATAL: Invalid URL in environment variables');
    process.exit(1);
  }

  logger.info('Environment validation passed', { status: 'success' });
}