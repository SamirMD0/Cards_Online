// backend/src/socket/handlers/game/botTurnProcessor.ts
import { Server } from 'socket.io';
import { GameState } from '../../../game/gameState.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { getBotMove } from '../../../bot/simpleBot.js';
import { applyCardEffect, getNextPlayer, checkWinner } from '../../../game/rules.js';

/**
 * Processes a bot's turn (draw or play)
 * This is a pure function - no socket coupling except for events
 * 
 * @param io - Socket.IO server for broadcasting
 * @param game - Game state (mutated in place)
 * @param roomId - Room to broadcast to
 * @param gameManager - For timer resets
 */
export async function processBotTurn(
  io: Server,
  game: GameState,
  roomId: string,
  gameManager: GameStateManager
) {
  try {
    if (game.winner) return;
    
    const bot = game.players.find(p => p.id === game.currentPlayer);
    if (!bot || !bot.isBot) return;
    
    console.log(`[BotTurn] ${bot.name} taking turn...`);
    
    // ✅ NEW: If there's a forced draw, bot MUST draw (no stacking)
    if (game.pendingDraw > 0) {
      const drawCount = game.pendingDraw;
      console.log(`[BotTurn] ${bot.name} forced to draw ${drawCount} cards`);
      
      for (let i = 0; i < drawCount; i++) {
        game.drawCard(bot.id);
      }
      
      game.pendingDraw = 0;
      
      io.to(roomId).emit('cards_drawn', {
        playerId: bot.id,
        count: drawCount,
        wasForced: true
      });
      
      // ✅ Turn ends after forced draw
      game.currentPlayer = getNextPlayer(game);
      io.to(roomId).emit('game_state', game.getPublicState());
      gameManager.resetGameTimer(roomId);
      await gameManager.saveGame(roomId);
      
      // Chain next bot turn if needed
      const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
      if (nextPlayer?.isBot) {
        setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
      }
      return;
    }
    
    // ✅ Normal bot logic (no forced draw)
    const topCard = game.discardPile[game.discardPile.length - 1];
    const move = getBotMove(bot.hand, topCard, game.currentColor);
    
    if (move.action === 'draw') {
      console.log(`[BotTurn] ${bot.name} drawing 1 card (no valid play)`);
      game.drawCard(bot.id);
      
      io.to(roomId).emit('cards_drawn', {
        playerId: bot.id,
        count: 1,
        wasForced: false
      });
      
      game.currentPlayer = getNextPlayer(game);
      
    } else if (move.action === 'play') {
      const card = move.card;
      const cardIndex = bot.hand.findIndex(c => c.id === card.id);
      
      if (cardIndex === -1) {
        console.error(`[BotTurn] Card not found in bot hand`);
        return;
      }
      
      bot.hand.splice(cardIndex, 1);
      game.discardPile.push(card);
      
      if (card.color === 'wild') {
        game.currentColor = move.chosenColor;
      } else {
        game.currentColor = card.color;
      }
      
      io.to(roomId).emit('card_played', {
        playerId: bot.id,
        card,
        chosenColor: game.currentColor
      });
      
      if (checkWinner(bot)) {
        game.winner = bot.id;
        io.to(roomId).emit('game_over', {
          winner: bot.name,
          winnerId: bot.id
        });
        return;
      }
      
      applyCardEffect(card, game);
      
      if (!['skip', 'reverse'].includes(card.value as string)) {
        game.currentPlayer = getNextPlayer(game);
      }
    }
    
    io.to(roomId).emit('game_state', game.getPublicState());
    gameManager.resetGameTimer(roomId);
    await gameManager.saveGame(roomId);
    
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
    }
    
  } catch (error) {
    console.error('[BotTurn] Error:', error);
  }
}