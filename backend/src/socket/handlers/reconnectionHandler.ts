import { Server } from 'socket.io';
import { Socket } from '../../types/socket.types.js';
import { GameStateManager } from '../../managers/GameStateManager.js';
import { emitError } from '../../utils/errors.js';

/**
 * Handle player reconnection after disconnect
 * 
 * Flow:
 * 1. Client detects disconnect
 * 2. On reconnect, client sends 'check_reconnection'
 * 3. Server checks if user was in an active game
 * 4. If yes, restore them to that game
 */
export function setupReconnectionHandler(
  io: Server,
  socket: Socket,
  gameManager: GameStateManager
) {
  
  /**
   * Check if user can reconnect to a game
   */
  socket.on('check_reconnection', async () => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit('reconnection_result', { canReconnect: false });
        return;
      }

      console.log(`[Reconnection] Checking reconnection for user ${userId}`);

      // Find if user was in a game
      const roomId = await gameManager.findRoomByUserId(userId);
      
      if (!roomId) {
        console.log(`[Reconnection] No active game found for user ${userId}`);
        socket.emit('reconnection_result', { canReconnect: false });
        return;
      }

      // Load game from Redis
      const game = await gameManager.getGame(roomId);
      
      if (!game) {
        console.log(`[Reconnection] Game ${roomId} no longer exists`);
        socket.emit('reconnection_result', { canReconnect: false });
        return;
      }

      // Check if game is still active (not finished)
      if (game.winner) {
        console.log(`[Reconnection] Game ${roomId} already finished`);
        socket.emit('reconnection_result', { 
          canReconnect: false,
          reason: 'Game has ended' 
        });
        return;
      }

      // Check if player is still in the game
      const player = game.players.find(p => p.id === userId);
      if (!player) {
        console.log(`[Reconnection] User ${userId} not in game ${roomId}`);
        socket.emit('reconnection_result', { canReconnect: false });
        return;
      }

      console.log(`[Reconnection] User ${userId} can reconnect to game ${roomId}`);
      
      socket.emit('reconnection_result', {
        canReconnect: true,
        roomId,
        gameState: game.getPublicState()
      });

    } catch (error) {
      console.error('[Reconnection] Check failed:', error);
      socket.emit('reconnection_result', { canReconnect: false });
    }
  });

  /**
   * Reconnect to an active game
   */
  socket.on('reconnect_to_game', async (data: { roomId: string }) => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        throw new Error('Authentication required');
      }

      const { roomId } = data;

      console.log(`[Reconnection] User ${userId} reconnecting to ${roomId}`);

      // Load game
      const game = await gameManager.getGame(roomId);
      if (!game) {
        throw new Error('Game not found');
      }

      // Verify player is in the game
      const player = game.players.find(p => p.id === userId);
      if (!player) {
        throw new Error('You are not in this game');
      }

      // Verify game is still active
      if (game.winner) {
        throw new Error('Game has already ended');
      }

      // Rejoin socket room
      socket.join(roomId);
      gameManager.setSocketRoom(socket.id, roomId);

      console.log(`[Reconnection] User ${userId} reconnected to ${roomId}`);

      // Send game state
      socket.emit('game_restored', {
        roomId,
        gameState: game.getPublicState(),
        yourHand: player.hand,
        message: 'Welcome back! Reconnected to game.'
      });

      // Notify other players
      socket.to(roomId).emit('player_reconnected', {
        playerId: userId,
        playerName: player.name
      });

      // Reset game timer
      gameManager.resetGameTimer(roomId);

    } catch (error) {
      console.error('[Reconnection] Reconnect failed:', error);
      emitError(socket, error);
    }
  });
}