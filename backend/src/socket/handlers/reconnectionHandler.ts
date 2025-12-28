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
  
  socket.on('check_reconnection', async () => {
    try {
      const userId = socket.data.userId;
      const username = socket.data.username;
      
      if (!userId) {
        console.log(`[ReconnectionCheck] No userId on socket, cannot check`);
        socket.emit('reconnection_result', { canReconnect: false });
        return;
      }

      console.log(`[ReconnectionCheck] Checking for user ${username} (${userId})`);

      // Find room in Redis
      const roomId = await gameManager.findRoomByUserId(userId);
      
      if (!roomId) {
        console.log(`[ReconnectionCheck] No active room found for ${username} (${userId})`);
        socket.emit('reconnection_result', { canReconnect: false });
        return;
      }

      console.log(`[ReconnectionCheck] Found room ${roomId} for ${username}`);

      // Load game
      const game = await gameManager.getGame(roomId);
      
      if (!game) {
        console.log(`[ReconnectionCheck] Room ${roomId} no longer exists`);
        socket.emit('reconnection_result', { canReconnect: false });
        return;
      }

      // Verify player is still in game
      const player = game.players.find(p => p.id === userId);
      if (!player) {
        console.log(`[ReconnectionCheck] User ${userId} not in game ${roomId}`);
        socket.emit('reconnection_result', { canReconnect: false });
        return;
      }

      // Check if game ended
      if (game.winner) {
        console.log(`[ReconnectionCheck] Game ${roomId} already finished`);
        socket.emit('reconnection_result', { 
          canReconnect: false,
          reason: 'Game has ended' 
        });
        return;
      }

      console.log(`[ReconnectionCheck] ✅ ${username} CAN reconnect to ${roomId}`);
      
      socket.emit('reconnection_result', {
        canReconnect: true,
        roomId,
        gameState: game.getPublicState()
      });

    } catch (error) {
      console.error('[ReconnectionCheck] Error:', error);
      socket.emit('reconnection_result', { canReconnect: false });
    }
  });

  socket.on('reconnect_to_game', async (data: { roomId: string }) => {
    try {
      const userId = socket.data.userId;
      const username = socket.data.username;
      
      if (!userId) {
        throw new Error('Authentication required');
      }

      const { roomId } = data;
      console.log(`[ReconnectToGame] ${username} (${userId}) reconnecting to ${roomId}`);

      const game = await gameManager.getGame(roomId);
      if (!game) {
        throw new Error('Game not found');
      }

      const player = game.players.find(p => p.id === userId);
      if (!player) {
        throw new Error('You are not in this game');
      }

      if (game.winner) {
        throw new Error('Game has already ended');
      }

      // Rejoin
      socket.join(roomId);
      gameManager.setSocketRoom(socket.id, roomId);

      console.log(`[ReconnectToGame] ✅ ${username} reconnected to ${roomId}`);

      // Send state
      socket.emit('game_restored', {
        roomId,
        gameState: game.getPublicState(),
        yourHand: player.hand,
        message: 'Welcome back! Reconnected to game.'
      });

      socket.to(roomId).emit('player_reconnected', {
        playerId: userId,
        playerName: player.name
      });

      gameManager.resetGameTimer(roomId);

    } catch (error) {
      console.error('[ReconnectToGame] Error:', error);
      emitError(socket, error);
    }
  });
}
