// backend/src/socket/handlers/game/playCardHandler.ts
import { Server } from 'socket.io';
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { validatePlayCard } from '../../../validators/schemas.js';
import { canPlayCard, applyCardEffect, getNextPlayer, checkWinner } from '../../../game/rules.js';
import { emitError } from '../../../utils/errors.js';
import { requireGameContext, requireTurn, requirePlayer } from './validators.js';
import { processBotTurn } from './botTurnProcessor.js';
import { GameHistoryService } from '../../../services/GameHistoryService.js';

export async function handlePlayCard(
  io: Server,
  socket: Socket,
  gameManager: GameStateManager,
  data: any
) {
  try {
    const validated = validatePlayCard(data);
    const { userId, roomId, game } = await requireGameContext(socket, gameManager);
    requireTurn(game, userId);
    const player = requirePlayer(game, userId);
    
    const cardIndex = player.hand.findIndex(c => c.id === validated.cardId);
    if (cardIndex === -1) {
      throw new Error('Card not found in your hand');
    }
    
    const card = player.hand[cardIndex];
    const topCard = game.discardPile[game.discardPile.length - 1];
    
    // ✅ NEW: If there's a pending draw, you MUST draw (no stacking)
    if (game.pendingDraw > 0) {
      throw new Error(`You must draw ${game.pendingDraw} cards first!`);
    }
    
    // Validate card can be played
    if (!canPlayCard(card, topCard, game.currentColor)) {
      throw new Error('This card cannot be played on the current card');
    }
    
    // Wild cards require color choice
    if (card.color === 'wild' && !validated.chosenColor) {
      throw new Error('You must choose a color for wild cards');
    }
    
    // Execute play
    player.hand.splice(cardIndex, 1);
    game.discardPile.push(card);
    
    // Set current color
    if (card.color === 'wild') {
      game.currentColor = validated.chosenColor as any;
    } else {
      game.currentColor = card.color;
    }
    
    console.log(`[PlayCard] ${player.name} played ${card.color} ${card.value}`);
    
    socket.emit('hand_update', { hand: player.hand });
    
    io.to(roomId).emit('card_played', {
      playerId: userId,
      card,
      chosenColor: game.currentColor
    });

    await gameManager.saveGame(roomId);
    
    // Check winner
    if (checkWinner(player)) {
      game.winner = userId;
      io.to(roomId).emit('game_over', {
        winner: player.name,
        winnerId: userId
      });
      return;
    }
    
    // ✅ NEW: Apply effects FIRST (may set pendingDraw)
    applyCardEffect(card, game);
    
    // ✅ NEW: Advance turn UNLESS skip/reverse already handled it
    if (!['skip', 'reverse'].includes(card.value as string)) {
      game.currentPlayer = getNextPlayer(game);
    }
    
    io.to(roomId).emit('game_state', game.getPublicState());
    gameManager.resetGameTimer(roomId);
    
    // ✅ NEW: If next player is human with pendingDraw, notify them
    if (game.pendingDraw > 0) {
      const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
      if (nextPlayer) {
        io.to(roomId).emit('forced_draw_pending', {
          playerId: nextPlayer.id,
          drawCount: game.pendingDraw
        });
      }
    }
    
    // Trigger bot turn if needed
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
    }
    
  } catch (error) {
    console.error('[PlayCard] Error:', error);
    emitError(socket, error);
  }
}