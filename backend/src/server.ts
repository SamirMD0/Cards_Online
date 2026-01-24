process.on('uncaughtException', (error) => {
  console.error('💥 FATAL: Uncaught exception during startup');
  console.error(error);
  process.exit(1); // Exit cleanly instead of crash-looping
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 FATAL: Unhandled promise rejection during startup');
  console.error(reason);
  process.exit(1);
});


import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { setupSocketIO } from "./socket/socketSetup.js";
import authRoutes from "./routes/auth.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import { AuthService } from "./services/AuthService.js";
import { validateEnvironment } from "./utils/validateEnv.js";
import helmet from "helmet";
import healthRoutes from "./routes/health.routes.js";
import { setupGracefulShutdown } from "./utils/shutdown.js";
import { hybridAuthLimiter } from "./middleware/hybridAuthRateLimit.js";

dotenv.config();
validateEnvironment();

const app = express();
export const server = createServer(app);

// ===================================
// FREE TIER: Production URLs
// ===================================
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 8080;  // Fly.io uses 8080

/* ======================
   TRUST PROXY (REQUIRED FOR FLY.IO)
   ====================== */
app.set("trust proxy", 1);

/* ======================
   RATE LIMITERS - MEMORY EFFICIENT
   ====================== */

// General API rate limit (50 requests/15min per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,  // Reduced from 100
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// ✅ Auth rate limiting is now handled by hybridAuthRateLimit.ts
// - IP-based: 20 failures/15min (anti-bot)
// - User-based: 5 failures/15min (anti-credential stuffing)

/* ======================
   GLOBAL MIDDLEWARE
   ====================== */

// ✅ FREE TIER: CORS for GitHub Pages + Fly.io
// Helper to remove trailing slashes
const normalizeUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const ALLOWED_ORIGINS = [
  normalizeUrl(process.env.CLIENT_URL),            // GitHub Pages (production)
  "https://cards-online-nu.vercel.app",            // Your GitHub Pages (NO TRAILING SLASH)
  "https://cards-online-two.vercel.app",           // New Vercel Deployment
  "http://localhost:5173",                         // Dev frontend
  "http://localhost:3000",                         // Alternative dev
].filter((url): url is string => !!url);           // Type guard to ensure strings

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json({ limit: "1mb" }));  // Memory limit
app.use(cookieParser());

/* ======================
   HEALTH CHECKS - LIGHTWEIGHT
   ====================== */

app.use(healthRoutes);

/* ======================
   API ROUTES
   ====================== */

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);  // ✅ Rate limiting handled inside routes (hybrid limiter)
app.use("/api/friends", friendRoutes);

/* ======================
   SOCKET.IO - MEMORY EFFICIENT
   ====================== */

export const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST"],
  },
  // ✅ Memory optimization for 256 MB
  maxHttpBufferSize: 1e6,  // 1 MB max
  pingTimeout: 20000,
  pingInterval: 25000,
});

setupSocketIO(io);

/* ======================
   BACKGROUND TASKS - MEMORY EFFICIENT
   ====================== */

// Cleanup expired sessions every hour (memory efficient)
setInterval(() => {
  AuthService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

// ✅ FREE TIER: Redis cleanup cron (every 6 hours)
setInterval(async () => {
  try {
    console.log('[Redis Cleanup] Starting expired key scan...');
    const { redis } = await import('./lib/redisClient.js');

    let cursor = '0';
    let deletedCount = 0;

    do {
      // Use SCAN to avoid blocking (safe for production)
      const result = await redis.scan(cursor, 'MATCH', 'game:*', 'COUNT', 100);
      cursor = result[0];
      const keys = result[1];

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        // Delete if expired or TTL < 1 hour (stale)
        if (ttl < 3600) {
          await redis.del(key);
          deletedCount++;
        }
      }
    } while (cursor !== '0');

    if (deletedCount > 0) {
      console.log(`[Redis Cleanup] ✅ Deleted ${deletedCount} expired keys`);
    }
  } catch (error) {
    console.error('[Redis Cleanup] Error:', error);
  }
}, 6 * 60 * 60 * 1000); // Every 6 hours

// ✅ FREE TIER: Metrics logging (every 5 minutes)
setInterval(() => {
  const used = process.memoryUsage();
  const heapMB = Math.round(used.heapUsed / 1024 / 1024);
  const rssMB = Math.round(used.rss / 1024 / 1024);
  const socketCount = io.engine.clientsCount;

  console.log(`[Metrics] Memory: ${heapMB}MB heap / ${rssMB}MB RSS | Sockets: ${socketCount}`);

  // ✅ Hybrid rate limiter monitoring
  const rateLimitStats = hybridAuthLimiter.getStats();
  console.log(`[HybridRateLimit] IPs: ${rateLimitStats.ipTracked} | Users: ${rateLimitStats.usersTracked} | Memory: ${rateLimitStats.totalMemoryKB}KB`);

  if (rateLimitStats.totalMemoryKB > 30 * 1024) {
    console.warn('[HybridRateLimit] ⚠️ WARNING: Memory usage exceeds 30MB threshold!');
  }
}, 5 * 60 * 1000); // Every 5 minutes

/* ======================
   GRACEFUL SHUTDOWN
   ====================== */

setupGracefulShutdown(server, io);

/* ======================
   START SERVER
   ====================== */

server.listen(PORT, () => {
  console.log("=================================");
  console.log("🎮 UNO Server (FREE TIER)");
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Client: ${CLIENT_URL}`);
  console.log(`📝 Env: ${process.env.NODE_ENV || "development"}`);
  console.log(`💾 Memory: 256 MB (Fly.io Free Tier)`);
  console.log("=================================");
});