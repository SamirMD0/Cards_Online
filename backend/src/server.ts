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

// Reduced limits for 256 MB memory
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,  // Reduced from 100
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,  // Reduced from 5
  skipSuccessfulRequests: true,
  message: { error: "Too many login attempts, try again in 15 minutes" },
});

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
app.use("/api/auth", authLimiter, authRoutes);
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