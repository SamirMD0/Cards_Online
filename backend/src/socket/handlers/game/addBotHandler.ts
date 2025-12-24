// backend/src/socket/handlers/game/addBotHandler.ts
import { Server } from 'socket.io';
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { emitError } from '../../../utils/errors.js';

export function handleAddBot(
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
    
    // Can't add bots after game starts
    if (game.gameStarted) {
      throw new Error('Cannot add bots after game has started');
    }
    
    // Check room capacity
    if (game.players.length >= 4) {
      throw new Error('Room is full (max 4 players)');
    }
    
    // Generate unique bot ID and name
    const botNumber = game.players.filter(p => p.isBot).length + 1;
    const botId = `bot-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const botName = `Bot ${botNumber}`;
    
    // Add bot to game
    const added = game.addPlayer(botId, botName, true);
    if (!added) {
      throw new Error('Failed to add bot');
    }
    
    console.log(`[Game] Bot added to room ${roomId}: ${botName}`);
    
    // Broadcast updates
    io.to(roomId).emit('game_state', game.getPublicState());
    io.to(roomId).emit('player_joined', {
      playerId: botId,
      playerName: botName
    });
    
  } catch (error) {
    console.error('[Game] Add bot error:', error);
    emitError(socket, error);
  }
}