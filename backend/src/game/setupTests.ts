// backend/src/__tests__/setup.ts
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });
dotenv.config();
// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long';
process.env.DATABASE_URL = 'postgresql://postgres:password4ryomen@localhost:5432/uno_game_test';
process.env.REDIS_URL = 'redis://localhost:6379/1'; // Use DB 1 for tests

// Increase timeout for integration tests
jest.setTimeout(10000);