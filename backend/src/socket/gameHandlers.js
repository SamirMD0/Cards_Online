import { GameState } from '../game/gameState.js';
import { canPlayCard, applyCardEffect, getNextPlayer, hasPlayableCard, checkWinner } from '../game/rules.js';
import { getBotMove } from '../bot/simpleBot.js';

const games = new Map(); // roomId -> GameState

export function setupGameHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Create or join room
    socket.on('join_room', ({ roomId, playerName }) => {
      let game = games.get(roomId);
      
      if (!game) {
        game = new GameState(roomId);
        games.set(roomId, game);
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
      
      io.to(roomId).emit('game_state', game.getPublicState());
      io.to(roomId).emit('player_joined', { playerId: socket.id, playerName });
    });
    
    // Add bot
    socket.on('add_bot', () => {
      const { roomId } = socket.data;
      const game = games.get(roomId);
      
      if (!game) return;
      
      const botId = `bot-${Date.now()}`;
      const botName = `Bot ${game.players.filter(p => p.isBot).length + 1}`;
      game.addPlayer(botId, botName, true);
      
      io.to(roomId).emit('game_state', game.getPublicState());
      io.to(roomId).emit('player_joined', { playerId: botId, playerName: botName });
    });
    
    // Start game
    socket.on('start_game', () => {
      const { roomId } = socket.data;
      const game = games.get(roomId);
      
      if (!game || !game.startGame()) {
        socket.emit('error', { message: 'Cannot start game' });
        return;
      }
      
      io.to(roomId).emit('game_started', game.getPublicState());
      
      // Send hands to each player
      game.players.forEach(player => {
        if (!player.isBot) {
          io.to(player.id).emit('hand_update', { hand: player.hand });
        }
      });
      
      // Check if first player is bot
      if (game.players.find(p => p.id === game.currentPlayer)?.isBot) {
        setTimeout(() => executeBotTurn(game, io), 1000);
      }
    });
    
    // Play card
    socket.on('play_card', ({ cardId, chosenColor }) => {
      const { roomId } = socket.data;
      const game = games.get(roomId);
      
      if (!game || socket.id !== game.currentPlayer) return;
      
      const player = game.players.find(p => p.id === socket.id);
      const cardIndex = player.hand.findIndex(c => c.id === cardId);
      
      if (cardIndex === -1) return;
      
      const card = player.hand[cardIndex];
      const topCard = game.discardPile[game.discardPile.length - 1];
      
      if (!canPlayCard(card, topCard, game.currentColor)) {
        socket.emit('error', { message: 'Invalid card' });
        return;
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
        io.to(roomId).emit('game_over', { winner: player.name });
        return;
      }
      
      // Move to next player
      if (!['skip', 'reverse'].includes(card.value)) {
        game.currentPlayer = getNextPlayer(game);
      }
      
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
    });
    
    // Draw card
    socket.on('draw_card', () => {
      const { roomId } = socket.data;
      const game = games.get(roomId);
      
      if (!game || socket.id !== game.currentPlayer) return;
      
      const drawnCards = game.drawCard(socket.id);
      const player = game.players.find(p => p.id === socket.id);
      
      // Handle pending draws (from Draw 2 or Draw 4)
      if (game.pendingDraw > 0) {
        for (let i = 1; i < game.pendingDraw; i++) {
          game.drawCard(socket.id);
        }
        game.pendingDraw = 0;
        game.currentPlayer = getNextPlayer(game);
      } else {
        // Check if drawn card is playable
        const topCard = game.discardPile[game.discardPile.length - 1];
        const drawnCard = drawnCards[0];
        
        if (canPlayCard(drawnCard, topCard, game.currentColor)) {
          socket.emit('can_play_drawn_card', { card: drawnCard });
        } else {
          game.currentPlayer = getNextPlayer(game);
        }
      }
      
      io.to(roomId).emit('card_drawn', { playerId: socket.id });
      io.to(roomId).emit('game_state', game.getPublicState());
      io.to(socket.id).emit('hand_update', { hand: player.hand });
      
      // Check if next player is bot
      const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
      if (nextPlayer?.isBot) {
        setTimeout(() => executeBotTurn(game, io), 1500);
      }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      const { roomId } = socket.data;
      const game = games.get(roomId);
      
      if (game) {
        game.removePlayer(socket.id);
        
        if (game.players.length === 0) {
          games.delete(roomId);
        } else {
          io.to(roomId).emit('player_left', { playerId: socket.id });
          io.to(roomId).emit('game_state', game.getPublicState());
        }
      }
      
      console.log(`Player disconnected: ${socket.id}`);
    });
  });
}

function executeBotTurn(game, io) {
  const bot = game.players.find(p => p.id === game.currentPlayer);
  if (!bot || !bot.isBot) return;
  
  const topCard = game.discardPile[game.discardPile.length - 1];
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
      io.to(game.roomId).emit('game_over', { winner: bot.name });
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
  
  io.to(game.roomId).emit('game_state', game.getPublicState());
  
  // Chain bot turns if next player is also a bot
  const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
  if (nextPlayer?.isBot) {
    setTimeout(() => executeBotTurn(game, io), 1500);
  }
}