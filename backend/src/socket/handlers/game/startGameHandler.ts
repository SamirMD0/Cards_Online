// backend/src/socket/handlers/game/startGameHandler.ts
import { Server } from 'socket.io';
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { emitError } from '../../../utils/errors.js';
import { requireGameContext } from './validators.js';
import { processBotTurn } from './botTurnProcessor.js';

export async function handleStartGame(
  io: Server,
  socket: Socket,
  gameManager: GameStateManager
) {
  try {
    const { userId, roomId, game } = await requireGameContext(socket, gameManager);
    
    // Validation: host check
    const hostId = game.players[0]?.id;
    if (hostId !== userId) {
      throw new Error('Only the host can start the game');
    }
    
    // Validation: player count
    if (game.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }
    
    // Start game
    const started = game.startGame();
    if (!started) {
      throw new Error('Failed to start game');
    }
    
    console.log(`[StartGame] Game started in room ${roomId}`);
    
    // Broadcast game state
    io.to(roomId).emit('game_started', game.getPublicState());
    
    // Send hands to each human player
    const socketsInRoom = Array.from(io.sockets.sockets.values()).filter(s => 
      gameManager.getSocketRoom(s.id) === roomId
    );
    
    game.players.forEach(player => {
      if (player.isBot) return;
      
      const playerSocket = socketsInRoom.find(s => s.data.userId === player.id);
      if (playerSocket) {
        console.log(`[StartGame] Sending ${player.hand.length} cards to ${player.name}`);
        playerSocket.emit('hand_update', { hand: player.hand });
      }
    });
    
    // Reset inactivity timer
    gameManager.resetGameTimer(roomId);
    
    // Trigger bot turn if first player is bot
    const firstPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (firstPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1000);
    }
    
  } catch (error) {
    console.error('[StartGame] Error:', error);
    emitError(socket, error);
  }
}