import { Socket } from 'socket.io';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  blockDuration?: number;  // How long to block after exceeding (default: windowMs)
}

class SocketRateLimiter {
  private requests = new Map<string, number[]>();
  private blocked = new Map<string, number>();

  constructor(private config: RateLimitConfig) {}

  check(socketId: string): boolean {
    const now = Date.now();
    
    // Check if currently blocked
    const blockedUntil = this.blocked.get(socketId);
    if (blockedUntil && now < blockedUntil) {
      return false; // Still blocked
    } else if (blockedUntil) {
      this.blocked.delete(socketId); // Unblock
    }

    // Get request timestamps for this socket
    if (!this.requests.has(socketId)) {
      this.requests.set(socketId, []);
    }

    const timestamps = this.requests.get(socketId)!;
    
    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(
      (t) => now - t < this.config.windowMs
    );

    // Check if limit exceeded
    if (validTimestamps.length >= this.config.maxRequests) {
      // Block the socket
      const blockUntil = now + (this.config.blockDuration || this.config.windowMs);
      this.blocked.set(socketId, blockUntil);
      
      console.warn(`[RateLimit] Blocked socket ${socketId} until ${new Date(blockUntil).toISOString()}`);
      return false;
    }

    // Add current timestamp and update
    validTimestamps.push(now);
    this.requests.set(socketId, validTimestamps);

    return true; // Allow request
  }

  cleanup() {
    const now = Date.now();
    
    // Clean up old request logs
    for (const [socketId, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter((t) => now - t < this.config.windowMs);
      if (valid.length === 0) {
        this.requests.delete(socketId);
      } else {
        this.requests.set(socketId, valid);
      }
    }

    // Clean up expired blocks
    for (const [socketId, blockedUntil] of this.blocked.entries()) {
      if (now >= blockedUntil) {
        this.blocked.delete(socketId);
      }
    }
  }
}

// Create rate limiters for different event types
export const globalLimiter = new SocketRateLimiter({
  windowMs: 1000,      // 1 second
  maxRequests: 10,     // 10 events per second
  blockDuration: 5000  // Block for 5 seconds if exceeded
});

export const createRoomLimiter = new SocketRateLimiter({
  windowMs: 60000,     // 1 minute
  maxRequests: 3,      // 3 rooms per minute
  blockDuration: 60000 // Block for 1 minute
});

export const gameActionLimiter = new SocketRateLimiter({
  windowMs: 1000,      // 1 second
  maxRequests: 5,      // 5 game actions per second
  blockDuration: 3000  // Block for 3 seconds
});

// Cleanup old data every minute
setInterval(() => {
  globalLimiter.cleanup();
  createRoomLimiter.cleanup();
  gameActionLimiter.cleanup();
}, 60000);

// Middleware factory
export function createRateLimitMiddleware(limiter: SocketRateLimiter) {
  return (socket: Socket, next: (err?: Error) => void) => {
    if (!limiter.check(socket.id)) {
      return next(new Error('Rate limit exceeded. Please slow down.'));
    }
    next();
  };
}