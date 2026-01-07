// backend/src/lib/logger.ts - REPLACE ENTIRE FILE

import winston from 'winston';
import { existsSync, mkdirSync } from 'fs';

// ✅ FIX: Ensure logs directory exists before creating logger
const logsDir = '/app/logs';
if (!existsSync(logsDir)) {
  try {
    mkdirSync(logsDir, { recursive: true });
    console.log(`✅ Created logs directory: ${logsDir}`);
  } catch (error) {
    console.error(`⚠️ Could not create logs directory, falling back to console only`);
  }
}

// ✅ FIX: Add fallback to console-only if file writes fail
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Only add file transports if logs directory exists
if (existsSync(logsDir)) {
  transports.push(
    new winston.transports.File({ 
      filename: `${logsDir}/error.log`, 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: `${logsDir}/combined.log` 
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports
});

// ✅ FIX: Test logger on startup
try {
  logger.info('Logger initialized successfully');
} catch (error) {
  console.error('⚠️ Logger test failed:', error);
}