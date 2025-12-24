// backend/src/socket/handlers/game/addBotHandler.ts
import { Server } from 'socket.io';
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { emitError } from '../../../utils/errors.js';
import { requireGameContext } from './validators.js';

export function handleAddBot(
  io: Server,
  socket: Socket,
  gameManager: GameStateManager
) {
  try {
    const { roomId, game } = requireGameContext(socket, gameManager);
    
    // Validation: game state
    if (game.gameStarted) {
      throw new Error('Cannot add bots after game has started');
    }
    
    if (game.players.length >= 4) {
      throw new Error('Room is full (max 4 players)');
    }
    
    // Generate bot identity
    const botNumber = game.players.filter(p => p.isBot).length + 1;
    const botId = `bot-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const botName = `Bot ${botNumber}`;
    
    // Add to game state
    const added = game.addPlayer(botId, botName, true);
    if (!added) {
      throw new Error('Failed to add bot');
    }
    
    console.log(`[AddBot] ${botName} added to room ${roomId}`);
    
    // Broadcast updates
    io.to(roomId).emit('game_state', game.getPublicState());
    io.to(roomId).emit('player_joined', {
      playerId: botId,
      playerName: botName
    });
    
  } catch (error) {
    console.error('[AddBot] Error:', error);
    emitError(socket, error);
  }
}