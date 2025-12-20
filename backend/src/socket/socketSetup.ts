import { Server } from 'socket.io';
import { Socket } from '../types/socket.types.js';
import { RoomService } from '../services/RoomService.js';
import { GameStateManager } from '../managers/GameStateManager.js';
import { setupRoomHandlers, handlePlayerLeave } from './handlers/roomHandlers.js';
// import { setupGameHandlers } from './handlers/gameHandlers.js'; // TODO: Create this

/**
 * Socket Setup: Initialize Socket.IO with all handlers
 * 
 * This is the ONLY place where Socket.IO is configured
 */

export function setupSocketIO(io: Server): void {
  // Get singleton instances of services
  const roomService = RoomService.getInstance();
  const gameManager = GameStateManager.getInstance();

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Player connected: ${socket.id}`);

    // Setup all handlers
    setupRoomHandlers(io, socket, roomService, gameManager);
    // setupGameHandlers(io, socket, roomService, gameManager); // TODO

    // Handle disconnection
    socket.on('disconnect', () => {
      handleDisconnection(io, socket, roomService, gameManager);
    });
  });

  console.log('[Socket] Socket.IO configured successfully');
}

/**
 * Handle player disconnection
 */
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

    console.log(`[Socket] Player disconnected: ${socket.id}`);
  } catch (error) {
    console.error('[Socket] Error handling disconnection:', error);
  }
}