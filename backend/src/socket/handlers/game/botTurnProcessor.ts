// backend/src/socket/handlers/game/botTurnProcessor.ts
import { Server } from 'socket.io';
import { GameState } from '../../../game/gameState.js';
import { GameStateManager } from '../../../managers/GameStateManager.js';
import { getBotMove } from '../../../bot/simpleBot.js';
import { applyCardEffect, getNextPlayer } from '../../../game/rules.js';

export function processBotTurn(
  io: Server,
  game: GameState,
  roomId: string,
  gameManager: GameStateManager
) {
  try {
    if (game.winner) {
      return;
    }
    
    const bot = game.players.find(p => p.id === game.currentPlayer);
    if (!bot || !bot.isBot) {
      return;
    }
    
    console.log(`[Bot] ${bot.name} taking turn...`);
    
    const topCard = game.discardPile[game.discardPile.length - 1];
    const move = getBotMove(bot.hand, topCard, game.currentColor);
    
    if (move.action === 'draw') {
      const drawCount = game.pendingDraw > 0 ? game.pendingDraw : 1;
      console.log(`[Bot] ${bot.name} drawing ${drawCount} card(s)`);
      
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
      const card = move.card;
      const cardIndex = bot.hand.findIndex(c => c.id === card.id);
      
      if (cardIndex === -1) {
        console.error('[Bot] Card not found in bot hand');
        return;
      }
      
      console.log(`[Bot] ${bot.name} playing ${card.color} ${card.value}`);
      
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
      
      if (bot.hand.length === 0) {
        game.winner = bot.id;
        console.log(`[Bot] ${bot.name} wins!`);
        
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
    
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
    }
    
  } catch (error) {
    console.error('[Bot] Error processing bot turn:', error);
  }
}