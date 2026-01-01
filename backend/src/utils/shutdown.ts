// backend/src/utils/shutdown.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redisClient.js';
import { logger } from '../lib/logger.js';

let isShuttingDown = false;

/**
 * Graceful shutdown handler for production deployments
 * Ensures all connections are closed cleanly before exit
 */
export function setupGracefulShutdown(
  httpServer: HTTPServer,
  socketServer: SocketServer
): void {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      logger.warn('Shutdown already in progress', { signal });
      return;
    }

    isShuttingDown = true;
    logger.info('Shutdown signal received', { signal });

    // Set a timeout to force exit if graceful shutdown takes too long
    const forceExitTimeout = setTimeout(() => {
      logger.error('Graceful shutdown timeout - forcing exit');
      process.exit(1);
    }, 30000); // 30 seconds max

    try {
      // Step 1: Stop accepting new connections
      logger.info('Closing HTTP server...');
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err) => {
          if (err) {
            logger.error('Error closing HTTP server', { error: err });
            reject(err);
          } else {
            logger.info('HTTP server closed');
            resolve();
          }
        });
      });

      // Step 2: Close all Socket.IO connections
      logger.info('Closing Socket.IO connections...');
      const sockets = await socketServer.fetchSockets();
      logger.info(`Disconnecting ${sockets.length} socket connections`);
      
      for (const socket of sockets) {
        socket.disconnect(true);
      }
      
      socketServer.close();
      logger.info('Socket.IO server closed');

      // Step 3: Close database connection
      logger.info('Closing database connection...');
      await prisma.$disconnect();
      logger.info('Database connection closed');

      // Step 4: Close Redis connection
      logger.info('Closing Redis connection...');
      await redis.quit();
      logger.info('Redis connection closed');

      // Clear the force exit timeout
      clearTimeout(forceExitTimeout);

      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', { error });
      clearTimeout(forceExitTimeout);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error });
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    shutdown('UNHANDLED_REJECTION');
  });

  logger.info('Graceful shutdown handlers registered');
}

/**
 * Check if server is currently shutting down
 * Use this to reject new requests during shutdown
 */
export function isServerShuttingDown(): boolean {
  return isShuttingDown;
}

// In server.ts, replace the existing SIGTERM handler with:
// import { setupGracefulShutdown } from './utils/shutdown.js';
// setupGracefulShutdown(httpServer, io);