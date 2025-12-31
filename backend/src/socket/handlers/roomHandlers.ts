import { Server } from 'socket.io';
import { Socket } from '../../types/socket.types.js';
import { RoomService } from '../../services/RoomService.js';
import { GameStateManager } from '../../managers/GameStateManager.js';
import { validateCreateRoom, validateJoinRoom } from '../../validators/schemas.js';
import { emitError } from '../../utils/errors.js';
import { logger } from '../../lib/logger.js';

export function setupRoomHandlers(
  io: Server,
  socket: Socket,
  roomService: RoomService,
  gameManager: GameStateManager
) {
  
  socket.on('get_rooms', async () => {
    try {
      const roomsList = await buildRoomsList(roomService, gameManager);
      socket.emit('rooms_list', roomsList);
    } catch (error) {
      emitError(socket, error);
    }
  });

  socket.on('check_room_exists', async (data: { roomId: string }) => {
    try {
      const { roomId } = data;
      const game = await gameManager.getGame(roomId);
      const room = roomService.getRoom(roomId);

      if (game && room) {
        socket.emit('room_exists', {
          exists: true,
          roomId,
          gameState: game.getPublicState()
        });
      } else {
        socket.emit('room_exists', {
          exists: false,
          roomId
        });
      }
    } catch (error) {
      socket.emit('room_exists', { exists: false, roomId: data.roomId });
    }
  });

  socket.on('create_room', async (data) => {
    try {
      const validated = validateCreateRoom(data);

      if (!socket.data.userId) {
        throw new Error('User not authenticated');
      }

      const metadata = roomService.createRoom(
        validated.roomName,
        validated.maxPlayers,
        socket.data.userId
      );

      const roomId = Array.from(roomService.getAllRooms().entries())
        .find(([_, meta]) => meta.roomCode === metadata.roomCode)?.[0];

      if (!roomId) {
        throw new Error('Failed to create room');
      }

      const game = await gameManager.createGame(roomId);
      const playerName = socket.data.username || 'Host';
      const added = game.addPlayer(socket.data.userId, playerName);
      
      if (!added) {
        throw new Error('Failed to add creator to room');
      }
      
      socket.join(roomId);
      gameManager.setSocketRoom(socket.id, roomId);
      await gameManager.saveGame(roomId);

      socket.emit('room_created', { roomId, roomCode: metadata.roomCode });
      socket.emit('joined_room', { roomId });
      socket.emit('game_state', game.getPublicState());

      await broadcastRoomsList(io, roomService, gameManager);

      logger.info('Room created', { username: socket.data.username, roomId });

    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * ✅ JOIN ROOM - ONLY for NEW players BEFORE game starts
   */
  socket.on('join_room', async (data) => {
    let validated: ReturnType<typeof validateJoinRoom> | undefined;
    try {
      validated = validateJoinRoom(data);
      const { roomId, playerName } = validated;
      const userId = socket.data.userId;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      logger.info('User attempting to join room', { userId, roomId });

      const game = await gameManager.getGameOrThrow(roomId);
      const room = roomService.getRoom(roomId);

      if (!room) {
        throw new Error('Room not found');
      }

      // ✅ CHECK: Is player already in game?
      const existingPlayer = game.players.find(p => p.id === userId);
      
      if (existingPlayer) {
        // ✅ Player already exists - this is a RECONNECTION scenario
        logger.warn('Player already in game, triggering reconnection', { userId, roomId });
        socket.emit('error', {
          message: 'You are already in this game. Reconnecting...'
        });

        // ✅ Auto-trigger reconnection flow
        socket.emit('should_reconnect', { roomId });
        return;
      }

      // ✅ CHECK: Is game already started?
      if (game.gameStarted) {
        logger.warn('Game already started, cannot join', { roomId });
        throw new Error('Game already started. Cannot join.');
      }

      // ✅ CHECK: Is room full?
      if (game.players.length >= room.maxPlayers) {
        throw new Error('Room is full');
      }

      // ✅ NEW PLAYER - Add to game
      logger.info('Adding new player to room', { userId, roomId, playerName });
      const added = game.addPlayer(userId, playerName);
      
      if (!added) {
        throw new Error('Failed to add player');
      }

      socket.join(roomId);
      gameManager.setSocketRoom(socket.id, roomId);
      gameManager.resetGameTimer(roomId);
      await gameManager.saveGame(roomId);

      socket.emit('joined_room', { roomId });
      io.to(roomId).emit('game_state', game.getPublicState());
      io.to(roomId).emit('player_joined', { playerId: userId, playerName });

      await broadcastRoomsList(io, roomService, gameManager);

      logger.info('Player joined room', { playerName, roomId });

    } catch (error) {
      logger.error('Error joining room', { error: error instanceof Error ? error.message : String(error), userId: socket.data.userId, roomId: validated?.roomId });
      emitError(socket, error);
    }
  });

  /**
   * ✅ RECONNECT TO GAME - ONLY for EXISTING players
   */
  socket.on('reconnect_to_game', async (data: { roomId: string }) => {
    try {
      const { roomId } = data;
      const userId = socket.data.userId;
      const username = socket.data.username;

      if (!userId) {
        throw new Error('Authentication required');
      }

      logger.info('User reconnecting to game', { username, userId, roomId });

      const game = await gameManager.getGame(roomId);
      
      if (!game) {
        throw new Error('Game not found');
      }

      const player = game.players.find(p => p.id === userId);
      
      if (!player) {
        throw new Error('You are not in this game');
      }

      if (game.winner) {
        throw new Error('Game has already ended');
      }

      // ✅ RECONNECT - Rejoin socket room
      const isInRoom = Array.from(socket.rooms).includes(roomId);
      if (!isInRoom) {
        socket.join(roomId);
      }
      
      gameManager.setSocketRoom(socket.id, roomId);
      gameManager.resetGameTimer(roomId);

      logger.info('User reconnected to game', { username, roomId });

      // ✅ Send full game state + player hand
      socket.emit('game_restored', {
        roomId,
        gameState: game.getPublicState(),
        yourHand: player.hand,
        message: 'Reconnected successfully'
      });

      // ✅ Notify others
      socket.to(roomId).emit('player_reconnected', {
        playerId: userId,
        playerName: player.name
      });

    } catch (error) {
      console.error('[ReconnectToGame] Error:', error);
      socket.emit('reconnection_failed', { 
        message: error instanceof Error ? error.message : 'Reconnection failed'
      });
    }
  });

  /**
   * ✅ REQUEST GAME STATE - Fallback for sync issues
   */
  socket.on('request_game_state', async (data: { roomId: string }) => {
    try {
      const { roomId } = data;
      const userId = socket.data.userId;
      
      if (!userId) {
        throw new Error('Authentication required');
      }

      const game = await gameManager.getGame(roomId);
      
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const player = game.players.find(p => p.id === userId);
      
      if (!player) {
        socket.emit('error', { message: 'You are not in this game' });
        return;
      }

      logger.info('Sending game state to user', { userId });

      socket.emit('game_state', game.getPublicState());

      if (game.gameStarted && !player.isBot) {
        socket.emit('hand_update', { hand: player.hand });
      }

    } catch (error) {
      console.error('[RequestGameState] Error:', error);
      socket.emit('error', { message: 'Failed to get game state' });
    }
  });

  socket.on('leave_room', async () => {
    try {
      const roomId = gameManager.getSocketRoom(socket.id);
      if (!roomId) return;
      await handlePlayerLeave(io, socket, roomId, roomService, gameManager);
    } catch (error) {
      emitError(socket, error);
    }
  });

  // ✅ CRITICAL: Handle socket disconnect
  socket.on('disconnect', async () => {
    try {
      const userId = socket.data.userId;
      const username = socket.data.username;
      
      console.log(`[Disconnect] User ${username} (${userId}) disconnected`);
      
      // Find which room this socket was in
      const roomId = gameManager.getSocketRoom(socket.id);
      
      if (roomId) {
        const game = await gameManager.getGame(roomId);
        
        if (game && game.gameStarted) {
          // ✅ Game started - DON'T remove player, they might reconnect
          logger.info('Game started, keeping user in game for potential reconnection', { username, userId, roomId });
          socket.leave(roomId);
          gameManager.removeSocketMapping(socket.id);
          
          // Notify others
          io.to(roomId).emit('player_disconnected', { 
            playerId: userId,
            playerName: username 
          });
          
        } else if (game) {
          // ✅ Game NOT started - remove player normally
          logger.info('Game not started, removing user from game', { username, userId, roomId });
          await handlePlayerLeave(io, socket, roomId, roomService, gameManager);
        }
      }
      
    } catch (error) {
      console.error('[Disconnect] Error:', error);
    }
  });
}

// Helper functions
async function buildRoomsList(roomService: RoomService, gameManager: GameStateManager): Promise<any[]> {
  const rooms: any[] = [];
  for (const [roomId, metadata] of roomService.getAllRooms().entries()) {
    const game = await gameManager.getGame(roomId);
    if (game) {
      rooms.push(gameManager.buildRoomListItem(roomId, game, metadata));
    }
  }
  return rooms;
}

async function broadcastRoomsList(io: Server, roomService: RoomService, gameManager: GameStateManager): Promise<void> {
  const roomsList = await buildRoomsList(roomService, gameManager);
  io.emit('rooms_list', roomsList);
}

// ✅ FIXED: Don't remove players from started games
export async function handlePlayerLeave(
  io: Server,
  socket: Socket,
  roomId: string,
  roomService: RoomService,
  gameManager: GameStateManager
): Promise<void> {
  const game = await gameManager.getGame(roomId);
  if (!game) return;

  const userId = socket.data.userId;
  if (!userId) return;

  // ✅ CRITICAL FIX: Don't remove players if game has started - they might reconnect!
  if (game.gameStarted) {
    logger.info('Game started, not removing player for potential reconnection', { userId, roomId });
    socket.leave(roomId);
    gameManager.removeSocketMapping(socket.id);
    
    const player = game.players.find(p => p.id === userId);

    // Just notify others they disconnected, but keep them in game
    io.to(roomId).emit('player_disconnected', { 
      playerId: userId,
      playerName: player?.name
    });
    return;
  }

  // ✅ Game NOT started - safe to remove player
  logger.info('Game not started, removing player', { userId, roomId });
  game.removePlayer(userId);
  socket.leave(roomId);
  gameManager.removeSocketMapping(socket.id);

  if (game.players.length === 0) {
    gameManager.deleteGame(roomId);
    roomService.deleteRoom(roomId);
  } else {
    io.to(roomId).emit('player_left', { playerId: userId });
    io.to(roomId).emit('game_state', game.getPublicState());
  }

  await broadcastRoomsList(io, roomService, gameManager);
}