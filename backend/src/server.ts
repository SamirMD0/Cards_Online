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
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 3001;

/* ======================
   TRUST PROXY (IMPORTANT)
   ====================== */
app.set("trust proxy", 1);

/* ======================
   RATE LIMITERS
   ====================== */

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Auth-specific limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: "Too many login attempts, try again in 15 minutes" },
});

/* ======================
   GLOBAL MIDDLEWARE
   ====================== */

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  "http://localhost:5173", // Dev frontend
  "http://localhost:3000", // Alternative dev port
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for now (complex with sockets)
    crossOriginEmbedderPolicy: false,
  })
);
app.use(express.json());
app.use(cookieParser());

/* ======================
   HEALTH CHECKS
   ====================== */

app.use(healthRoutes);

/* ======================
   API ROUTES
   ====================== */

// Apply general limiter to all API routes
app.use("/api", apiLimiter);

// Auth routes (login/register should be limited inside router if needed)
app.use("/api/auth", authLimiter, authRoutes);

// Other protected routes
app.use("/api/friends", friendRoutes);

/* ======================
   SOCKET.IO
   ====================== */

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS.filter(
      (url): url is string => typeof url === "string"
    ),
    credentials: true,
    methods: ["GET", "POST"],
  },
});

setupSocketIO(io);

/* ======================
   BACKGROUND TASKS
   ====================== */

setInterval(() => {
  AuthService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

/* ======================
   GRACEFUL SHUTDOWN
   ====================== */

setupGracefulShutdown(httpServer, io);

/* ======================
   START SERVER
   ====================== */

httpServer.listen(PORT, () => {
  console.log("=================================");
  console.log("🎮 UNO Server");
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Client: ${CLIENT_URL}`);
  console.log(`📝 Env: ${process.env.NODE_ENV || "development"}`);
  console.log("=================================");
});
