// backend/src/socket/handlers/game/startGameHandler.ts
import { Server } from 'socket.io';
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { emitError } from '../../../utils/errors.js';
import { processBotTurn } from './botTurnProcessor.js';

export function handleStartGame(
  io: Server,
  socket: Socket,
  gameManager: GameStateManager
) {
  try {
    const roomId = gameManager.getPlayerRoom(socket.id);
    if (!roomId) {
      throw new Error('You are not in a room');
    }
    
    const game = gameManager.getGameOrThrow(roomId);
    
    // Validate host (use userId)
    if (game.players.length > 0 && game.players[0].id !== socket.data.userId) {
      throw new Error('Only the host can start the game');
    }
    
    // Validate player count
    if (game.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }
    
    // Start the game
    const started = game.startGame();
    if (!started) {
      throw new Error('Failed to start game');
    }
    
    console.log(`[Game] Game started in room ${roomId}`);
    
    // Broadcast game state to all players
    io.to(roomId).emit('game_started', game.getPublicState());
    
    // ✅ CRITICAL: Send each player their hand using socket lookup
    const socketsInRoom = Array.from(io.sockets.sockets.values()).filter(s => 
      gameManager.getPlayerRoom(s.id) === roomId
    );
    
    game.players.forEach(player => {
      // Find the socket that belongs to this userId
      const playerSocket = socketsInRoom.find(s => s.data.userId === player.id);
      if (playerSocket && !player.isBot) {
        console.log(`[Game] 📤 Sending ${player.hand.length} cards to ${player.name}`);
        playerSocket.emit('hand_update', { hand: player.hand });
      }
    });
    
    // Reset inactivity timer
    gameManager.resetGameTimer(roomId);
    
    // If first player is a bot, trigger bot turn
    const firstPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (firstPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1000);
    }
    
  } catch (error) {
    console.error('[Game] Start game error:', error);
    emitError(socket, error);
  }
}