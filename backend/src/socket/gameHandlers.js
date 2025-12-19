import { GameState } from '../game/gameState.js';
import { canPlayCard, applyCardEffect, getNextPlayer, checkWinner } from '../game/rules.js';
import { getBotMove } from '../bot/simpleBot.js';

const games = new Map(); // roomId -> GameState
const gameTimers = new Map(); // roomId -> timeout
const playerRooms = new Map(); // socketId -> roomId
const roomMetadata = new Map(); // roomId -> { roomName, roomCode, maxPlayers, createdAt }

const GAME_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const VALID_COLORS = ['red', 'blue', 'green', 'yellow'];
const MAX_BOTS = 3;

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function resetGameTimer(roomId) {
  if (gameTimers.has(roomId)) {
    clearTimeout(gameTimers.get(roomId));
  }
  
  const timer = setTimeout(() => {
    const game = games.get(roomId);
    if (game) {
      console.log(`Game ${roomId} timed out due to inactivity`);
      games.delete(roomId);
      roomMetadata.delete(roomId);
      gameTimers.delete(roomId);
    }
  }, GAME_TIMEOUT);
  
  gameTimers.set(roomId, timer);
}

function getRoomsList() {
  const rooms = [];
  games.forEach((game, roomId) => {
    const metadata = roomMetadata.get(roomId);
    if (metadata) {
      rooms.push({
        id: roomId,
        roomName: metadata.roomName,
        roomCode: metadata.roomCode,
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.id === game.players[0]?.id,
          isReady: true,
          isBot: p.isBot
        })),
        maxPlayers: metadata.maxPlayers,
        gameStarted: game.gameStarted
      });
    }
  });
  return rooms;
}

export function setupGameHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Get all rooms
    socket.on('get_rooms', () => {
      const rooms = getRoomsList();
      socket.emit('rooms_list', rooms);
    });

    // Create room
    socket.on('create_room', ({ roomName, maxPlayers }) => {
      try {
        if (!roomName || roomName.length > 50) {
          socket.emit('error', { message: 'Invalid room name' });
          return;
        }

        if (maxPlayers < 2 || maxPlayers > 4) {
          socket.emit('error', { message: 'Max players must be 2-4' });
          return;
        }

        const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const roomCode = generateRoomCode();
        
        const game = new GameState(roomId);
        games.set(roomId, game);
        
        roomMetadata.set(roomId, {
          roomName: roomName.trim(),
          roomCode,
          maxPlayers,
          createdAt: Date.now()
        });
        
        resetGameTimer(roomId);
        
        socket.emit('room_created', { roomId, roomCode });
        
        // Broadcast updated rooms list
        io.emit('rooms_list', getRoomsList());
        
        console.log(`Room created: ${roomId} (${roomCode})`);
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    // Join room
    socket.on('join_room', ({ roomId, playerName }) => {
      try {
        if (!roomId || !playerName) {
          socket.emit('error', { message: 'Room ID and player name required' });
          return;
        }

        const game = games.get(roomId);
        if (!game) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const metadata = roomMetadata.get(roomId);
        if (!metadata) {
          socket.emit('error', { message: 'Room metadata not found' });
          return;
        }

        if (game.gameStarted) {
          socket.emit('error', { message: 'Game already started' });
          return;
        }

        if (game.players.length >= metadata.maxPlayers) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }

        const added = game.addPlayer(socket.id, playerName.trim());
        if (!added) {
          socket.emit('error', { message: 'Failed to join room' });
          return;
        }

        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.playerName = playerName.trim();
        playerRooms.set(socket.id, roomId);
        
        resetGameTimer(roomId);
        
        socket.emit('joined_room', { roomId });
        io.to(roomId).emit('game_state', game.getPublicState());
        io.to(roomId).emit('player_joined', { playerId: socket.id, playerName: playerName.trim() });
        
        // Broadcast updated rooms list
        io.emit('rooms_list', getRoomsList());
        
        console.log(`${playerName} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave room
    socket.on('leave_room', () => {
      try {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;

        const game = games.get(roomId);
        if (game) {
          game.removePlayer(socket.id);
          
          if (game.players.length === 0) {
            games.delete(roomId);
            roomMetadata.delete(roomId);
            if (gameTimers.has(roomId)) {
              clearTimeout(gameTimers.get(roomId));
              gameTimers.delete(roomId);
            }
          } else {
            io.to(roomId).emit('player_left', { playerId: socket.id });
            io.to(roomId).emit('game_state', game.getPublicState());
          }
          
          // Broadcast updated rooms list
          io.emit('rooms_list', getRoomsList());
        }

        socket.leave(roomId);
        playerRooms.delete(socket.id);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });
    
    // Add bot
    socket.on('add_bot', () => {
      try {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;
        
        const game = games.get(roomId);
        if (!game) return;
        
        if (game.gameStarted) {
          socket.emit('error', { message: 'Cannot add bots after game started' });
          return;
        }
        
        const metadata = roomMetadata.get(roomId);
        if (game.players.length >= metadata.maxPlayers) {
          socket.emit('error', { message: 'Room is full' });
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
        
        // Broadcast updated rooms list
        io.emit('rooms_list', getRoomsList());
      } catch (error) {
        console.error('Error adding bot:', error);
        socket.emit('error', { message: 'Failed to add bot' });
      }
    });
    
    // Start game
    socket.on('start_game', () => {
      try {
        const roomId = playerRooms.get(socket.id);
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
        
        // Broadcast updated rooms list
        io.emit('rooms_list', getRoomsList());
        
        // Check if first player is bot
        const firstPlayer = game.players.find(p => p.id === game.currentPlayer);
        if (firstPlayer?.isBot) {
          setTimeout(() => executeBotTurn(game, io), 1000);
        }
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });
    
    // Play card
    socket.on('play_card', ({ cardId, chosenColor }) => {
      try {
        const roomId = playerRooms.get(socket.id);
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
        
        if (game.pendingDraw > 0 && !['draw2', 'wild_draw4'].includes(card.value)) {
          socket.emit('error', { message: `You must draw ${game.pendingDraw} cards` });
          return;
        }
        
        if (!canPlayCard(card, topCard, game.currentColor)) {
          socket.emit('error', { message: 'Invalid card' });
          return;
        }
        
        if (card.color === 'wild') {
          if (!chosenColor || !VALID_COLORS.includes(chosenColor)) {
            socket.emit('error', { message: 'Invalid color choice' });
            return;
          }
        }
        
        player.hand.splice(cardIndex, 1);
        game.discardPile.push(card);
        
        if (card.color === 'wild') {
          game.currentColor = chosenColor;
        } else {
          game.currentColor = card.color;
        }
        
        applyCardEffect(card, game);
        
        if (checkWinner(player)) {
          game.winner = socket.id;
          clearTimeout(gameTimers.get(roomId));
          io.to(roomId).emit('game_over', { 
            winner: player.name,
            winnerId: socket.id 
          });
          return;
        }
        
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
        
        const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
        if (nextPlayer?.isBot) {
          setTimeout(() => executeBotTurn(game, io), 1500);
        }
      } catch (error) {
        console.error('Error playing card:', error);
        socket.emit('error', { message: 'Failed to play card' });
      }
    });
    
    // Draw card
    socket.on('draw_card', () => {
      try {
        const roomId = playerRooms.get(socket.id);
        if (!roomId) return;
        
        const game = games.get(roomId);
        if (!game || !game.gameStarted) return;
        
        if (socket.id !== game.currentPlayer) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }
        
        const player = game.players.find(p => p.id === socket.id);
        if (!player) return;
        
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
          const drawnCards = game.drawCard(socket.id);
          io.to(roomId).emit('card_drawn', { playerId: socket.id });
          
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
        
        const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
        if (nextPlayer?.isBot) {
          setTimeout(() => executeBotTurn(game, io), 1500);
        }
      } catch (error) {
        console.error('Error drawing card:', error);
        socket.emit('error', { message: 'Failed to draw card' });
      }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      try {
        const roomId = playerRooms.get(socket.id);
        const game = games.get(roomId);
        
        if (game) {
          game.removePlayer(socket.id);
          
          if (game.players.length === 0) {
            games.delete(roomId);
            roomMetadata.delete(roomId);
            if (gameTimers.has(roomId)) {
              clearTimeout(gameTimers.get(roomId));
              gameTimers.delete(roomId);
            }
          } else {
            io.to(roomId).emit('player_left', { playerId: socket.id });
            io.to(roomId).emit('game_state', game.getPublicState());
            
            if (game.gameStarted && game.currentPlayer === socket.id) {
              game.currentPlayer = game.players[0].id;
              const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
              if (nextPlayer?.isBot) {
                setTimeout(() => executeBotTurn(game, io), 1500);
              }
            }
          }
          
          // Broadcast updated rooms list
          io.emit('rooms_list', getRoomsList());
        }
        
        playerRooms.delete(socket.id);
        console.log(`Player disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });
}

function executeBotTurn(game, io) {
  try {
    if (!games.has(game.roomId)) return;
    
    const bot = game.players.find(p => p.id === game.currentPlayer);
    if (!bot || !bot.isBot) return;
    
    const topCard = game.discardPile[game.discardPile.length - 1];
    
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
    
    const nextPlayer = game.players.find(p => p.id === game.currentPlayer);
    if (nextPlayer?.isBot && games.has(game.roomId)) {
      setTimeout(() => executeBotTurn(game, io), 1500);
    }
  } catch (error) {
    console.error('Error in executeBotTurn:', error);
  }
}