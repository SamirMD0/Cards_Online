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
    // Validate input schema
    const validated = validatePlayCard(data);
    
    // Validate game context
    const { userId, roomId, game } = await requireGameContext(socket, gameManager);
    requireTurn(game, userId);
    const player = requirePlayer(game, userId);
    
    // Find card in hand
    const cardIndex = player.hand.findIndex(c => c.id === validated.cardId);
    if (cardIndex === -1) {
      throw new Error('Card not found in your hand');
    }
    
    const card = player.hand[cardIndex];
    const topCard = game.discardPile[game.discardPile.length - 1];
    
    // Validate card can be played
    if (!canPlayCard(card, topCard, game.currentColor)) {
      throw new Error('This card cannot be played on the current card');
    }
    
    // Special case: pending draw forces draw cards only
    if (game.pendingDraw > 0) {
      const isDrawCard = card.value === 'draw2' || card.value === 'wild_draw4';
      if (!isDrawCard) {
        throw new Error(`You must draw ${game.pendingDraw} cards or play a Draw 2/Draw 4`);
      }
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
    
    console.log(`[PlayCard] ${player.name} played ${card.color} ${card.value}, hand: ${player.hand.length} cards`);
    
    // Send updated hand to player
    socket.emit('hand_update', { hand: player.hand });
    
    // Broadcast card played
    io.to(roomId).emit('card_played', {
      playerId: userId,
      card,
      chosenColor: game.currentColor
    });

    // ✅ ADD THIS after emitting card_played
     await gameManager.saveGame(roomId);
    
    // Check for winner
    if (checkWinner(player)) {
      game.winner = userId;
      console.log(`[PlayCard] ${player.name} wins!`);
      
      io.to(roomId).emit('game_over', {
        winner: player.name,
        winnerId: userId
      });
      
      return; // Game over, don't continue
    }
    
    // Apply card effects (skip, reverse, draw2, draw4)
    applyCardEffect(card, game);
    
    // Advance turn (unless skip/reverse already moved it)
    if (!['skip', 'reverse'].includes(card.value as string)) {
      game.currentPlayer = getNextPlayer(game);
    }
    
    // Broadcast state
    io.to(roomId).emit('game_state', game.getPublicState());
    
    // Reset timer
    gameManager.resetGameTimer(roomId);
    
    // Trigger bot turn if next player is bot
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
    }
    
  } catch (error) {
    console.error('[PlayCard] Error:', error);
    emitError(socket, error);
  }
}