// backend/src/socket/socketSetup.ts
import { Server } from 'socket.io';
import { Socket } from '../types/socket.types.js';
import { RoomService } from '../services/RoomService.js';
import { GameStateManager } from '../managers/GameStateManager.js';
import { socketAuthMiddleware } from '../middleware/socketAuth.js';
import { setupRoomHandlers, handlePlayerLeave } from './handlers/roomHandlers.js';
import { setupGameHandlers } from './handlers/game/index.js'; // ✅ NEW IMPORT

export function setupSocketIO(io: Server): void {
  const roomService = RoomService.getInstance();
  const gameManager = GameStateManager.getInstance();

  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User ${socket.data.username} connected: ${socket.id}`);

    setupRoomHandlers(io, socket, roomService, gameManager);
    setupGameHandlers(io, socket, roomService, gameManager); // ✅ USES NEW STRUCTURE

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
    const roomId = gameManager.getSocketRoom(socket.id); // ✅ FIXED METHOD NAME
    
    if (roomId) {
      handlePlayerLeave(io, socket, roomId, roomService, gameManager);
    }

    console.log(`[Socket] User ${socket.data.username} disconnected: ${socket.id}`);
  } catch (error) {
    console.error('[Socket] Error handling disconnection:', error);
  }
}
