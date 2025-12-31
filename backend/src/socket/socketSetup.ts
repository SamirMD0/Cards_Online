import { Server } from 'socket.io';
import { Socket } from '../types/socket.types.js';
import { RoomService } from '../services/RoomService.js';
import { GameStateManager } from '../managers/GameStateManager.js';
import { socketAuthMiddleware } from '../middleware/socketAuth.js';
import { setupRoomHandlers, handlePlayerLeave } from './handlers/roomHandlers.js';
import { setupGameHandlers } from './handlers/game/index.js';
import { setupReconnectionHandler } from './handlers/reconnectionHandler.js';
import { 
  globalLimiter, 
  createRoomLimiter, 
  gameActionLimiter 
} from '../middleware/socketRateLimit.js'; // ✅ ADD THIS

export function setupSocketIO(io: Server): void {
  const roomService = RoomService.getInstance();
  const gameManager = GameStateManager.getInstance();

  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User ${socket.data.username} connected: ${socket.id}`);

    // ✅ ADD GLOBAL RATE LIMITING
    socket.use((packet, next) => {
      const [event] = packet;

      // Apply global rate limit (10 events/second)
      if (!globalLimiter.check(socket.id)) {
        console.warn(`[RateLimit] Socket ${socket.id} exceeded global limit`);
        socket.emit('error', { 
          message: 'Too many requests. Please slow down.' 
        });
        return; // Block the event
      }

      // Apply specific rate limits
      if (event === 'create_room') {
        if (!createRoomLimiter.check(socket.id)) {
          console.warn(`[RateLimit] Socket ${socket.id} exceeded room creation limit`);
          socket.emit('error', { 
            message: 'Too many rooms created. Wait 1 minute.' 
          });
          return;
        }
      }

      if (['play_card', 'draw_card'].includes(event)) {
        if (!gameActionLimiter.check(socket.id)) {
          console.warn(`[RateLimit] Socket ${socket.id} exceeded game action limit`);
          socket.emit('error', { 
            message: 'Too many game actions. Slow down.' 
          });
          return;
        }
      }

      next(); // Allow event
    });

    setupRoomHandlers(io, socket, roomService, gameManager);
    setupGameHandlers(io, socket, roomService, gameManager);
    setupReconnectionHandler(io, socket, gameManager);

    socket.on('disconnect', () => {
      handleDisconnection(io, socket, roomService, gameManager);
    });
  });

  console.log('[Socket] Socket.IO configured with authentication and rate limiting');
}

function handleDisconnection(
  io: Server,
  socket: Socket,
  roomService: RoomService,
  gameManager: GameStateManager
): void {
  try {
    const roomId = gameManager.getSocketRoom(socket.id);
    
    if (roomId) {
      handlePlayerLeave(io, socket, roomId, roomService, gameManager);
    }

    console.log(`[Socket] User ${socket.data.username} disconnected: ${socket.id}`);
  } catch (error) {
    console.error('[Socket] Error handling disconnection:', error);
  }
}