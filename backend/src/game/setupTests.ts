import dotenv from 'dotenv';

// Load test environment variables from .env.test (not committed)
dotenv.config({ path: '.env.test' });

// Increase timeout for integration tests (Socket.IO, DB, Redis)
jest.setTimeout(10000);
