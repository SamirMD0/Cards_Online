import { Server } from 'socket.io';
import { Socket } from '../../types/socket.types.js';
import { GameStateManager } from '../../managers/GameStateManager.js';
import { RoomService } from '../../services/RoomService.js';
import { validatePlayCard } from '../../validators/schemas.js';
import { canPlayCard, applyCardEffect, getNextPlayer, checkWinner, hasPlayableCard } from '../../game/rules.js';
import { emitError } from '../../utils/errors.js';
import { getBotMove } from '../../bot/simpleBot.js';
import { GameState } from '../../game/gameState.js';
import { Card } from '../../types/game.types.js';

export function setupGameHandlers(
  io: Server,
  socket: Socket,
  roomService: RoomService,
  gameManager: GameStateManager
) {
  
  /**
   * START GAME
   * Only host can start, requires 2+ players
   */
  socket.on('start_game', () => {
    try {
      const roomId = gameManager.getPlayerRoom(socket.id);
      if (!roomId) {
        throw new Error('You are not in a room');
      }
      
      const game = gameManager.getGameOrThrow(roomId);
      
      // Validate host
      if (game.players.length > 0 && game.players[0].id !== socket.id) {
        throw new Error('Only the host can start the game');
      }
      
      // Validate player count
      if (game.players.length < 2) {
        throw new Error('Need at least 2 players to start');
      }
      
      // Start the game
      const started = game.startGame();
      if (!started) {
        throw new Error('Failed to start game');
      }
      
      console.log(`[Game] Game started in room ${roomId}`);
      
      // Broadcast game state to all players
      io.to(roomId).emit('game_started', game.getPublicState());
      
      // Send each player their hand privately
      game.players.forEach(player => {
        io.to(player.id).emit('hand_update', { hand: player.hand });
      });
      
      // Reset inactivity timer
      gameManager.resetGameTimer(roomId);
      
      // If first player is a bot, trigger bot turn
      const firstPlayer = game.players.find(p => p.id === game.currentPlayer);
      if (firstPlayer?.isBot) {
        setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1000);
      }
      
    } catch (error) {
      console.error('[Game] Start game error:', error);
      emitError(socket, error);
    }
  });

  /**
   * PLAY CARD
   * Player attempts to play a card from their hand
   */
  socket.on('play_card', (data) => {
    try {
      const validated = validatePlayCard(data);
      const roomId = gameManager.getPlayerRoom(socket.id);
      
      if (!roomId) {
        throw new Error('You are not in a room');
      }
      
      const game = gameManager.getGameOrThrow(roomId);
      
      // Validate it's player's turn
      if (game.currentPlayer !== socket.id) {
        throw new Error('It is not your turn');
      }
      
      // Find player and card
      const player = game.players.find(p => p.id === socket.id);
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
      
      console.log(`[Game] ${player.name} played ${card.color} ${card.value}`);
      
      // Broadcast card played
      io.to(roomId).emit('card_played', {
        playerId: socket.id,
        card,
        chosenColor: game.currentColor
      });
      
      // Check for winner
      if (checkWinner(player)) {
        game.winner = socket.id;
        console.log(`[Game] ${player.name} wins!`);
        
        io.to(roomId).emit('game_over', {
          winner: player.name,
          winnerId: socket.id
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
      io.to(socket.id).emit('hand_update', { hand: player.hand });
      
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
  });

  /**
   * DRAW CARD
   * Player draws cards (either 1 normal draw or pending draw amount)
   */
  socket.on('draw_card', () => {
    try {
      const roomId = gameManager.getPlayerRoom(socket.id);
      if (!roomId) {
        throw new Error('You are not in a room');
      }
      
      const game = gameManager.getGameOrThrow(roomId);
      
      // Validate turn
      if (game.currentPlayer !== socket.id) {
        throw new Error('It is not your turn');
      }
      
      const player = game.players.find(p => p.id === socket.id);
      if (!player) {
        throw new Error('Player not found');
      }
      
      // Determine how many cards to draw
      const drawCount = game.pendingDraw > 0 ? game.pendingDraw : 1;
      
      console.log(`[Game] ${player.name} drawing ${drawCount} card(s)`);
      
      // Draw the cards
      const drawnCards: Card[] = [];
      for (let i = 0; i < drawCount; i++) {
        const drawn = game.drawCard(socket.id);
        if (drawn.length > 0) {
          drawnCards.push(drawn[0]);
        }
      }
      
      // Clear pending draws
      game.pendingDraw = 0;
      
      // Broadcast draw event (without showing cards to others)
      io.to(roomId).emit('cards_drawn', {
        playerId: socket.id,
        count: drawnCards.length
      });
      
      // Send updated hand to player
      io.to(socket.id).emit('hand_update', { hand: player.hand });
      
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
  });

  /**
   * ADD BOT
   * Add an AI player to the room
   */
  socket.on('add_bot', () => {
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
  });
}

/**
 * BOT AI - Process bot's turn
 */
function processBotTurn(
  io: Server,
  game: GameState,
  roomId: string,
  gameManager: GameStateManager
) {
  try {
    // Check if game is over
    if (game.winner) {
      return;
    }
    
    // Get current bot player
    const bot = game.players.find(p => p.id === game.currentPlayer);
    if (!bot || !bot.isBot) {
      return;
    }
    
    console.log(`[Bot] ${bot.name} taking turn...`);
    
    const topCard = game.discardPile[game.discardPile.length - 1];
    const move = getBotMove(bot.hand, topCard, game.currentColor);
    
    if (move.action === 'draw') {
      // Bot draws cards
      const drawCount = game.pendingDraw > 0 ? game.pendingDraw : 1;
      
      console.log(`[Bot] ${bot.name} drawing ${drawCount} card(s)`);
      
      for (let i = 0; i < drawCount; i++) {
        game.drawCard(bot.id);
      }
      
      game.pendingDraw = 0;
      
      // Broadcast
      io.to(roomId).emit('cards_drawn', {
        playerId: bot.id,
        count: drawCount
      });
      
      // Next player
      game.currentPlayer = getNextPlayer(game);
      
    } else if (move.action === 'play') {
      // Bot plays a card
      const card = move.card;
      const cardIndex = bot.hand.findIndex(c => c.id === card.id);
      
      if (cardIndex === -1) {
        console.error('[Bot] Card not found in bot hand');
        return;
      }
      
      console.log(`[Bot] ${bot.name} playing ${card.color} ${card.value}`);
      
      // Remove card from hand
      bot.hand.splice(cardIndex, 1);
      game.discardPile.push(card);
      
      // Set color
      if (card.color === 'wild') {
        game.currentColor = move.chosenColor;
      } else {
        game.currentColor = card.color;
      }
      
      // Broadcast
      io.to(roomId).emit('card_played', {
        playerId: bot.id,
        card,
        chosenColor: game.currentColor
      });
      
      // Check winner
      if (bot.hand.length === 0) {
        game.winner = bot.id;
        console.log(`[Bot] ${bot.name} wins!`);
        
        io.to(roomId).emit('game_over', {
          winner: bot.name,
          winnerId: bot.id
        });
        
        return;
      }
      
      // Apply effects
      applyCardEffect(card, game);
      
      // Move to next player if not already moved
      if (!['skip', 'reverse'].includes(card.value as string)) {
        game.currentPlayer = getNextPlayer(game);
      }
    }
    
    // Broadcast state
    io.to(roomId).emit('game_state', game.getPublicState());
    
    // Reset timer
    gameManager.resetGameTimer(roomId);
    
    // Chain bot turns if next player is also a bot
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot) {
      setTimeout(() => processBotTurn(io, game, roomId, gameManager), 1500);
    }
    
  } catch (error) {
    console.error('[Bot] Error processing bot turn:', error);
  }
}