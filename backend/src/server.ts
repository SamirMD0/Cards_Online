import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import dotenv from 'dotenv';
import { setupSocketIO } from './socket/socketSetup.js';
import authRoutes from './routes/auth.routes.js'; 
import { AuthService } from './services/AuthService.js'; 
import friendRoutes from './routes/friend.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration
app.use(cors({
  origin: CLIENT_URL,
  credentials: true // IMPORTANT: Allow cookies
}));

// Middleware
app.use(express.json());
app.use(cookieParser()); // ADD THIS

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    const { prisma } = await import('./lib/prisma.js');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Auth routes
app.use('/api/auth', authRoutes); // ADD THIS

app.use('/api/friends', friendRoutes);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true
  }
});

setupSocketIO(io);

// Clean up expired sessions every hour
setInterval(() => {
  AuthService.cleanupExpiredSessions();
}, 60 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log('=================================');
  console.log(`🎮 UNO Server v2.0`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${CLIENT_URL}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: PostgreSQL`);
  console.log('=================================');
});