import { Server } from 'socket.io';
import { GameState } from '../../../game/gameState.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { RoomService } from '../../../services/RoomService.js';
import { GameHistoryService } from '../../../services/GameHistoryService.js';
import { TurnTimerManager } from '../../../managers/TurnTimerManager.js';

/**
 * Centralized game cleanup after winner is determined
 * 
 * Flow:
 * 1. Save game to PostgreSQL
 * 2. Clear turn timer
 * 3. Delete from Redis
 * 4. Remove from memory
 * 5. Delete room metadata
 * 6. Close socket room (after 30s delay for clients to see winner)
 */
export async function cleanupFinishedGame(
  io: Server,
  roomId: string,
  game: GameState,
  gameManager: GameStateManager,
  roomService: RoomService
): Promise<void> {
  try {
    console.log(`[GameCleanup] Starting cleanup for finished game ${roomId}`);

    // 1. Get room metadata for saving
    const room = roomService.getRoom(roomId);
    if (!room) {
      console.warn(`[GameCleanup] Room ${roomId} not found in RoomService`);
      return;
    }

    // 2. Save to PostgreSQL
    console.log(`[GameCleanup] Saving game ${roomId} to database...`);
    await GameHistoryService.saveCompletedGame(game, room.roomCode);

    // 3. Clear turn timer IMMEDIATELY (before delay) to prevent orphaned timeouts
    const timerManager = TurnTimerManager.getInstance();
    timerManager.clearTimer(roomId);

    // 4. Wait 30 seconds for clients to see winner screen
    console.log(`[GameCleanup] Waiting 30s before cleanup...`);
    await new Promise(resolve => setTimeout(resolve, 30000));

    // 5. Notify clients that room is closing
    io.to(roomId).emit('room_closing', {
      message: 'Game has ended. Redirecting to lobby...'
    });

    // 6. Delete from Redis and memory
    await gameManager.deleteGame(roomId);

    // 7. Delete room metadata
    roomService.deleteRoom(roomId);

    // 8. Close socket room (disconnect all clients)
    const socketsInRoom = await io.in(roomId).fetchSockets();
    for (const socket of socketsInRoom) {
      socket.leave(roomId);
      gameManager.removeSocketMapping(socket.id);
    }

    console.log(`[GameCleanup] ✅ Cleanup complete for ${roomId}`);

  } catch (error) {
    console.error(`[GameCleanup] Error during cleanup:`, error);
  }
}