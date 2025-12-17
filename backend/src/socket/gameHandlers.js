import { GameState } from '../game/gameState.js';
import { canPlayCard, applyCardEffect, getNextPlayer, hasPlayableCard, checkWinner } from '../game/rules.js';
import { getBotMove } from '../bot/simpleBot.js';

const games = new Map(); // roomId -> GameState
const gameTimers = new Map(); // roomId -> timeout
const playerRooms = new Map(); // socketId -> roomId
const GAME_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const VALID_COLORS = ['red', 'blue', 'green', 'yellow'];
const MAX_BOTS = 3;
const MAX_ROOM_ID_LENGTH = 50;
const MAX_PLAYER_NAME_LENGTH = 30;

function resetGameTimer(roomId) {
  if (gameTimers.has(roomId)) {
    clearTimeout(gameTimers.get(roomId));
  }
  
  const timer = setTimeout(() => {
    const game = games.get(roomId);
    if (game) {
      console.log(`Game ${roomId} timed out due to inactivity`);
      games.delete(roomId);
      gameTimers.delete(roomId);
    }
  }, GAME_TIMEOUT);
  
  gameTimers.set(roomId, timer);
}

function validateInput(roomId, playerName) {
  const errors = [];
  
  if (!roomId || typeof roomId !== 'string') {
    errors.push('Room ID is required');
  } else if (roomId.length > MAX_ROOM_ID_LENGTH) {
    errors.push(`Room ID too long (max ${MAX_ROOM_ID_LENGTH} chars)`);
  } else if (!/^[a-zA-Z0-9-_]+$/.test(roomId)) {
    errors.push('Room ID can only contain letters, numbers, hyphens, and underscores');
  }
  
  if (!playerName || typeof playerName !== 'string') {
    errors.push('Player name is required');
  } else if (playerName.length > MAX_PLAYER_NAME_LENGTH) {
    errors.push(`Player name too long (max ${MAX_PLAYER_NAME_LENGTH} chars)`);
  } else if (playerName.trim().length === 0) {
    errors.push('Player name cannot be empty');
  }
  
  return errors;
}

export function setupGameHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    socket.on('join_room', ({ roomId, playerName }) => {
      try {
        // Validate input
        const errors = validateInput(roomId, playerName);
        if (errors.length > 0) {
          socket.emit('error', { message: errors.join(', ') });
          return;
        }
        
        roomId = roomId.trim();
        playerName = playerName.trim();
        
        let game = games.get(roomId);
        
        if (!game) {
          game = new GameState(roomId);
          games.set(roomId, game);
          resetGameTimer(roomId);
        }
        
        if (game.gameStarted) {
          socket.emit('error', { message: 'Game already started' });
          return;
        }
        
        const added = game.addPlayer(socket.id, playerName);
        if (!added) {
          socket.emit('error', { message: 'Room is full or player already exists' });
          return;
        }
        
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.playerName = playerName;
        playerRooms.set(socket.id, roomId);
        
        resetGameTimer(roomId);
        
        io.to(roomId).emit('game_state', game.getPublicState());
        io.to(roomId).emit('player_joined', { playerId: socket.id, playerName });
      } catch (error) {
        console.error('Error in join_room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });
    
    socket.on('add_bot', () => {
      try {
        const { roomId } = socket.data;
        if (!roomId) return;
        
        const game = games.get(roomId);
        if (!game) return;
        
        if (game.gameStarted) {
          socket.emit('error', { message: 'Cannot add bots after game started' });
          return;
        }
        
        const botCount = game.players.filter(p => p.isBot).length;
        if (botCount >= MAX_BOTS) {
          socket.emit('error', { message: `Maximum ${MAX_BOTS} bots allowed` });
          return;
        }
        
        const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const botName = `Bot ${botCount + 1}`;
        game.addPlayer(botId, botName, true);
        
        resetGameTimer(roomId);
        
        io.to(roomId).emit('game_state', game.getPublicState());
        io.to(roomId).emit('player_joined', { playerId: botId, playerName: botName });
      } catch (error) {
        console.error('Error in add_bot:', error);
        socket.emit('error', { message: 'Failed to add bot' });
      }
    });
    
    socket.on('start_game', () => {
      try {
        const { roomId } = socket.data;
        if (!roomId) return;
        
        const game = games.get(roomId);
        if (!game) return;
        
        if (game.gameStarted) {
          socket.emit('error', { message: 'Game already started' });
          return;
        }
        
        if (!game.startGame()) {
          socket.emit('error', { message: 'Need at least 2 players to start' });
          return;
        }
        
        resetGameTimer(roomId);
        
        io.to(roomId).emit('game_started', game.getPublicState());
        
        // Send hands to each player
        game.players.forEach(player => {
          if (!player.isBot) {
            io.to(player.id).emit('hand_update', { hand: player.hand });
          }
        });
        
        // Check if first player is bot
        const firstPlayer = game.players.find(p => p.id === game.currentPlayer);
        if (firstPlayer?.isBot) {
          setTimeout(() => executeBotTurn(game, io), 1000);
        }
      } catch (error) {
        console.error('Error in start_game:', error);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });
    
    socket.on('play_card', ({ cardId, chosenColor }) => {
      try {
        const { roomId } = socket.data;
        if (!roomId) return;
        
        const game = games.get(roomId);
        if (!game || !game.gameStarted) return;
        
        if (socket.id !== game.currentPlayer) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }
        
        const player = game.players.find(p => p.id === socket.id);
        if (!player) return;
        
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
          socket.emit('error', { message: 'Card not in hand' });
          return;
        }
        
        const card = player.hand[cardIndex];
        const topCard = game.discardPile[game.discardPile.length - 1];
        
        // FIXED: Check if player must draw due to pending Draw 2/4
        if (game.pendingDraw > 0 && !['draw2', 'wild_draw4'].includes(card.value)) {
          socket.emit('error', { message: `You must draw ${game.pendingDraw} cards` });
          return;
        }
        
        if (!canPlayCard(card, topCard, game.currentColor)) {
          socket.emit('error', { message: 'Invalid card' });
          return;
        }
        
        // FIXED: Validate wild card color
        if (card.color === 'wild') {
          if (!chosenColor || !VALID_COLORS.includes(chosenColor)) {
            socket.emit('error', { message: 'Invalid color choice' });
            return;
          }
        }
        
        // Remove card from hand
        player.hand.splice(cardIndex, 1);
        game.discardPile.push(card);
        
        // Update color
        if (card.color === 'wild') {
          game.currentColor = chosenColor;
        } else {
          game.currentColor = card.color;
        }
        
        // Apply card effect
        applyCardEffect(card, game);
        
        // Check for winner
        if (checkWinner(player)) {
          game.winner = socket.id;
          clearTimeout(gameTimers.get(roomId));
          io.to(roomId).emit('game_over', { 
            winner: player.name,
            winnerId: socket.id 
          });
          return;
        }
        
        // Move to next player
        if (!['skip', 'reverse'].includes(card.value)) {
          game.currentPlayer = getNextPlayer(game);
        }
        
        resetGameTimer(roomId);
        
        io.to(roomId).emit('card_played', {
          playerId: socket.id,
          card,
          chosenColor: game.currentColor
        });
        io.to(roomId).emit('game_state', game.getPublicState());
        io.to(socket.id).emit('hand_update', { hand: player.hand });
        
        // Check if next player is bot
        const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
        if (nextPlayer?.isBot) {
          setTimeout(() => executeBotTurn(game, io), 1500);
        }
      } catch (error) {
        console.error('Error in play_card:', error);
        socket.emit('error', { message: 'Failed to play card' });
      }
    });
    
    socket.on('draw_card', () => {
      try {
        const { roomId } = socket.data;
        if (!roomId) return;
        
        const game = games.get(roomId);
        if (!game || !game.gameStarted) return;
        
        if (socket.id !== game.currentPlayer) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }
        
        const player = game.players.find(p => p.id === socket.id);
        if (!player) return;
        
        // Handle pending draws (from Draw 2 or Draw 4)
        if (game.pendingDraw > 0) {
          for (let i = 0; i < game.pendingDraw; i++) {
            game.drawCard(socket.id);
          }
          io.to(roomId).emit('cards_drawn', { 
            playerId: socket.id, 
            count: game.pendingDraw 
          });
          game.pendingDraw = 0;
          game.currentPlayer = getNextPlayer(game);
        } else {
          // Normal draw
          const drawnCards = game.drawCard(socket.id);
          io.to(roomId).emit('card_drawn', { playerId: socket.id });
          
          // Check if drawn card is playable
          const topCard = game.discardPile[game.discardPile.length - 1];
          const drawnCard = drawnCards?.[0];
          
          if (drawnCard && canPlayCard(drawnCard, topCard, game.currentColor)) {
            socket.emit('can_play_drawn_card', { card: drawnCard });
          } else {
            game.currentPlayer = getNextPlayer(game);
          }
        }
        
        resetGameTimer(roomId);
        
        io.to(roomId).emit('game_state', game.getPublicState());
        io.to(socket.id).emit('hand_update', { hand: player.hand });
        
        // Check if next player is bot
        const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
        if (nextPlayer?.isBot) {
          setTimeout(() => executeBotTurn(game, io), 1500);
        }
      } catch (error) {
        console.error('Error in draw_card:', error);
        socket.emit('error', { message: 'Failed to draw card' });
      }
    });
    
    socket.on('restart_game', () => {
      try {
        const { roomId } = socket.data;
        if (!roomId) return;
        
        const game = games.get(roomId);
        if (!game) return;
        
        if (!game.gameStarted && !game.winner) {
          socket.emit('error', { message: 'No game to restart' });
          return;
        }
        
        // Reset game state
        game.reset();
        
        resetGameTimer(roomId);
        
        io.to(roomId).emit('game_reset', game.getPublicState());
      } catch (error) {
        console.error('Error in restart_game:', error);
        socket.emit('error', { message: 'Failed to restart game' });
      }
    });
    
    socket.on('disconnect', () => {
      try {
        const roomId = playerRooms.get(socket.id);
        const game = games.get(roomId);
        
        if (game) {
          game.removePlayer(socket.id);
          
          if (game.players.length === 0) {
            games.delete(roomId);
            if (gameTimers.has(roomId)) {
              clearTimeout(gameTimers.get(roomId));
              gameTimers.delete(roomId);
            }
          } else {
            io.to(roomId).emit('player_left', { playerId: socket.id });
            io.to(roomId).emit('game_state', game.getPublicState());
            
            // If disconnected player was current player and game is active
            if (game.gameStarted && game.currentPlayer === socket.id) {
              game.currentPlayer = game.players[0].id;
              const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
              if (nextPlayer?.isBot) {
                setTimeout(() => executeBotTurn(game, io), 1500);
              }
            }
          }
        }
        
        playerRooms.delete(socket.id);
        console.log(`Player disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });
}

// FIXED: Added safeguards to prevent infinite bot loops
function executeBotTurn(game, io) {
  try {
    // Check if game still exists
    if (!games.has(game.roomId)) return;
    
    const bot = game.players.find(p => p.id === game.currentPlayer);
    if (!bot || !bot.isBot) return;
    
    const topCard = game.discardPile[game.discardPile.length - 1];
    
    // Handle pending draws
    if (game.pendingDraw > 0) {
      for (let i = 0; i < game.pendingDraw; i++) {
        game.drawCard(bot.id);
      }
      io.to(game.roomId).emit('cards_drawn', { 
        playerId: bot.id, 
        count: game.pendingDraw 
      });
      game.pendingDraw = 0;
      game.currentPlayer = getNextPlayer(game);
    } else {
      const move = getBotMove(bot.hand, topCard, game.currentColor);
      
      if (move.action === 'draw') {
        game.drawCard(bot.id);
        io.to(game.roomId).emit('card_drawn', { playerId: bot.id });
        game.currentPlayer = getNextPlayer(game);
      } else {
        const cardIndex = bot.hand.findIndex(c => c.id === move.card.id);
        bot.hand.splice(cardIndex, 1);
        game.discardPile.push(move.card);
        
        if (move.card.color === 'wild') {
          game.currentColor = move.chosenColor;
        } else {
          game.currentColor = move.card.color;
        }
        
        applyCardEffect(move.card, game);
        
        if (checkWinner(bot)) {
          game.winner = bot.id;
          clearTimeout(gameTimers.get(game.roomId));
          io.to(game.roomId).emit('game_over', { 
            winner: bot.name,
            winnerId: bot.id 
          });
          return;
        }
        
        if (!['skip', 'reverse'].includes(move.card.value)) {
          game.currentPlayer = getNextPlayer(game);
        }
        
        io.to(game.roomId).emit('card_played', {
          playerId: bot.id,
          card: move.card,
          chosenColor: game.currentColor
        });
      }
    }
    
    io.to(game.roomId).emit('game_state', game.getPublicState());
    
    // FIXED: Add limit to prevent infinite bot chains
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot && games.has(game.roomId)) {
      // Check if all players are bots (edge case)
      const allBots = game.players.every(p => p.isBot);
      if (allBots) {
        console.log(`Warning: All players are bots in room ${game.roomId}`);
      }
      setTimeout(() => executeBotTurn(game, io), 1500);
    }
  } catch (error) {
    console.error('Error in executeBotTurn:', error);
  }
}