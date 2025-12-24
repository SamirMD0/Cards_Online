// backend/src/socket/handlers/game/playCardHandler.ts
import { Server } from 'socket.io';
import { Socket } from '../../../types/socket.types.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { validatePlayCard } from '../../../validators/schemas.js';
import { canPlayCard, applyCardEffect, getNextPlayer, checkWinner } from '../../../game/rules.js';
import { emitError } from '../../../utils/errors.js';
import { processBotTurn } from './botTurnProcessor.js';

export function handlePlayCard(
  io: Server,
  socket: Socket,
  gameManager: GameStateManager,
  data: any
) {
  try {
    const validated = validatePlayCard(data);
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
    
    // Find player by userId
    const player = game.players.find(p => p.id === userId);
    if (!player) {
      throw new Error('Player not found in game');
    }
    
    const cardIndex = player.hand.findIndex(c => c.id === validated.cardId);
    if (cardIndex === -1) {
      throw new Error('Card not found in your hand');
    }
    
    const card = player.hand[cardIndex];
    const topCard = game.discardPile[game.discardPile.length - 1];
    
    // Validate the card can be played
    if (!canPlayCard(card, topCard, game.currentColor)) {
      throw new Error('This card cannot be played on the current card');
    }
    
    // Special case: If there's a pending draw, only draw cards can be played
    if (game.pendingDraw > 0) {
      const isDrawCard = card.value === 'draw2' || card.value === 'wild_draw4';
      if (!isDrawCard) {
        throw new Error(`You must draw ${game.pendingDraw} cards or play a Draw 2/Draw 4`);
      }
    }
    
    // Wild cards require a color choice
    if (card.color === 'wild' && !validated.chosenColor) {
      throw new Error('You must choose a color for wild cards');
    }
    
    // Execute the play
    player.hand.splice(cardIndex, 1);
    game.discardPile.push(card);
    
    // Set the current color
    if (card.color === 'wild') {
      game.currentColor = validated.chosenColor as any;
    } else {
      game.currentColor = card.color;
    }
    
    console.log(`[Game] ${player.name} played ${card.color} ${card.value}, hand now has ${player.hand.length} cards`);
    
    // ✅ CRITICAL: Send updated hand to player IMMEDIATELY
    console.log(`[Game] 📤 Sending updated hand to ${player.name} (${player.hand.length} cards)`);
    socket.emit('hand_update', { hand: player.hand });
    
    // Broadcast card played
    io.to(roomId).emit('card_played', {
      playerId: userId,
      card,
      chosenColor: game.currentColor
    });
    
    // Check for winner
    if (checkWinner(player)) {
      game.winner = userId;
      console.log(`[Game] ${player.name} wins!`);
      
      io.to(roomId).emit('game_over', {
        winner: player.name,
        winnerId: userId
      });
      
      return;
    }
    
    // Apply card effects (skip, reverse, draw2, draw4)
    applyCardEffect(card, game);
    
    // Move to next player if not already moved by effect
    if (!['skip', 'reverse'].includes(card.value as string)) {
      game.currentPlayer = getNextPlayer(game);
    }
    
    // Broadcast updated game state
    io.to(roomId).emit('game_state', game.getPublicState());
    
    // Reset timer
    gameManager.resetGameTimer(roomId);
    
    // Trigger bot turn if next player is bot
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
    }
    
  } catch (error) {
    console.error('[Game] Play card error:', error);
    emitError(socket, error);
  }
}