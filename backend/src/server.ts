import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocketIO } from './socket/socketSetup.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true
  }
});

// Initialize Socket.IO handlers
setupSocketIO(io);

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log('=================================');
  console.log(`🎮 UNO Server v2.0`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${CLIENT_URL}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================');
});