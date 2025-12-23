import { Server } from 'socket.io';
import { Socket } from '../types/socket.types.js';
import { RoomService } from '../services/RoomService.js';
import { GameStateManager } from '../managers/GameStateManager.js';
import { socketAuthMiddleware } from '../middleware/socketAuth.js'; // ADD THIS
import { setupRoomHandlers, handlePlayerLeave } from './handlers/roomHandlers.js';
import { setupGameHandlers } from './handlers/gameHandlers.js';

export function setupSocketIO(io: Server): void {
  const roomService = RoomService.getInstance();
  const gameManager = GameStateManager.getInstance();

  // APPLY AUTH MIDDLEWARE
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User ${socket.data.username} connected: ${socket.id}`);

    // Setup all handlers
    setupRoomHandlers(io, socket, roomService, gameManager);
    setupGameHandlers(io, socket, roomService, gameManager);

    // Handle disconnection
    socket.on('disconnect', () => {
      handleDisconnection(io, socket, roomService, gameManager);
    });
  });

  console.log('[Socket] Socket.IO configured with authentication');
}

function handleDisconnection(
  io: Server,
  socket: Socket,
  roomService: RoomService,
  gameManager: GameStateManager
): void {
  try {
    const roomId = gameManager.getPlayerRoom(socket.id);
    
    if (roomId) {
      handlePlayerLeave(io, socket, roomId, roomService, gameManager);
    }

    console.log(`[Socket] User ${socket.data.username} disconnected: ${socket.id}`);
  } catch (error) {
    console.error('[Socket] Error handling disconnection:', error);
  }
}