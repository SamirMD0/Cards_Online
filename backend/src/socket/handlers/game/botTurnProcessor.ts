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
    // Guard: game over
    if (game.winner) return;
    
    // Guard: current player is human
    const bot = game.players.find(p => p.id === game.currentPlayer);
    if (!bot || !bot.isBot) return;
    
    console.log(`[BotTurn] ${bot.name} taking turn...`);
    
    // Get bot decision
    const topCard = game.discardPile[game.discardPile.length - 1];
    const move = getBotMove(bot.hand, topCard, game.currentColor);
    
    if (move.action === 'draw') {
      // Bot draws cards
      const drawCount = game.pendingDraw > 0 ? game.pendingDraw : 1;
      console.log(`[BotTurn] ${bot.name} drawing ${drawCount} card(s)`);
      
      for (let i = 0; i < drawCount; i++) {
        game.drawCard(bot.id);
      }
      
      game.pendingDraw = 0;
      
      io.to(roomId).emit('cards_drawn', {
        playerId: bot.id,
        count: drawCount
      });
      
      game.currentPlayer = getNextPlayer(game);
      
    } else if (move.action === 'play') {
      // Bot plays a card
      const card = move.card;
      const cardIndex = bot.hand.findIndex(c => c.id === card.id);
      
      if (cardIndex === -1) {
        console.error(`[BotTurn] Card ${card.id} not found in ${bot.name}'s hand`);
        return;
      }
      
      console.log(`[BotTurn] ${bot.name} playing ${card.color} ${card.value}`);
      
      bot.hand.splice(cardIndex, 1);
      game.discardPile.push(card);
      
      // Set color
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
      
      // Check winner
      if (checkWinner(bot)) {
        game.winner = bot.id;
        console.log(`[BotTurn] ${bot.name} wins!`);
        
        io.to(roomId).emit('game_over', {
          winner: bot.name,
          winnerId: bot.id
        });
        
        return; // Game over
      }
      
      // Apply effects
      applyCardEffect(card, game);
      
      // Advance turn
      if (!['skip', 'reverse'].includes(card.value as string)) {
        game.currentPlayer = getNextPlayer(game);
      }
    }
    
    // Broadcast state
    io.to(roomId).emit('game_state', game.getPublicState());
    
    // Reset timer
    gameManager.resetGameTimer(roomId);

    await gameManager.saveGame(roomId);
    
    // Chain bot turns if next player is also bot
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
    }
    
  } catch (error) {
    console.error('[BotTurn] Error:', error);
  }
}