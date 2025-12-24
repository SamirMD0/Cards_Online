// backend/src/socket/handlers/game/drawCardHandler.ts
import { Server } from 'socket.io';
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { getNextPlayer } from '../../../game/rules.js';
import { emitError } from '../../../utils/errors.js';
import { processBotTurn } from './botTurnProcessor.js';
import { Card } from '../../../types/game.types.js';

export function handleDrawCard(
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
    const userId = socket.data.userId;
    
    // ✅ CRITICAL: Use userId for turn validation
    if (game.currentPlayer !== userId) {
      throw new Error('It is not your turn');
    }
    
    const player = game.players.find(p => p.id === userId);
    if (!player) {
      throw new Error('Player not found');
    }
    
    // Determine how many cards to draw
    const drawCount = game.pendingDraw > 0 ? game.pendingDraw : 1;
    
    console.log(`[Game] ${player.name} drawing ${drawCount} card(s)`);
    
    // Draw the cards
    const drawnCards: Card[] = [];
    for (let i = 0; i < drawCount; i++) {
      const drawn = game.drawCard(userId);
      if (drawn.length > 0) {
        drawnCards.push(drawn[0]);
      }
    }
    
    // Clear pending draws
    game.pendingDraw = 0;
    
    // Broadcast draw event (without showing cards to others)
    io.to(roomId).emit('cards_drawn', {
      playerId: userId,
      count: drawnCards.length
    });
    
    // ✅ CRITICAL: Send updated hand to player
    console.log(`[Game] 📤 Sending updated hand to ${player.name} (${player.hand.length} cards)`);
    socket.emit('hand_update', { hand: player.hand });
    
    // Move to next player
    game.currentPlayer = getNextPlayer(game);
    
    // Broadcast state
    io.to(roomId).emit('game_state', game.getPublicState());
    
    // Reset timer
    gameManager.resetGameTimer(roomId);
    
    // Trigger bot if next is bot
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
    }
    
  } catch (error) {
    console.error('[Game] Draw card error:', error);
    emitError(socket, error);
  }
}