import { Server } from 'socket.io';
import { Socket } from '../../types/socket.types.js';
import { RoomService } from '../../services/RoomService.js';
import { GameStateManager } from '../../managers/GameStateManager.js';
import { validateCreateRoom, validateJoinRoom } from '../../validators/schemas.js';
import { emitError } from '../../utils/errors.js';

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

      console.log(`[RoomHandlers] ${socket.data.username} created room ${roomId}`);

    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * ✅ JOIN ROOM - ONLY for NEW players BEFORE game starts
   */
  socket.on('join_room', async (data) => {
    try {
      const validated = validateJoinRoom(data);
      const { roomId, playerName } = validated;
      const userId = socket.data.userId;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log(`[JoinRoom] User ${userId} attempting to join ${roomId}`);

      const game = await gameManager.getGameOrThrow(roomId);
      const room = roomService.getRoom(roomId);

      if (!room) {
        throw new Error('Room not found');
      }

      // ✅ CHECK: Is player already in game?
      const existingPlayer = game.players.find(p => p.id === userId);
      
      if (existingPlayer) {
        // ✅ Player already exists - this is a RECONNECTION scenario
        console.log(`[JoinRoom] ⚠️ Player ${userId} already in game - use reconnect_to_game instead`);
        socket.emit('error', {
          message: 'You are already in this game. Reconnecting...'
        });

        // ✅ Auto-trigger reconnection flow
        socket.emit('should_reconnect', { roomId });
        return;
      }

      // ✅ CHECK: Is game already started?
      if (game.gameStarted) {
        console.log(`[JoinRoom] ❌ Game ${roomId} already started, new players cannot join`);
        throw new Error('Game already started. Cannot join.');
      }

      // ✅ CHECK: Is room full?
      if (game.players.length >= room.maxPlayers) {
        throw new Error('Room is full');
      }

      // ✅ NEW PLAYER - Add to game
      console.log(`[JoinRoom] ✅ Adding new player ${userId} to ${roomId}`);
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

      console.log(`[JoinRoom] ✅ ${playerName} joined room ${roomId}`);

    } catch (error) {
      console.error('[JoinRoom] Error:', error);
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

      console.log(`[ReconnectToGame] ${username} (${userId}) reconnecting to ${roomId}`);

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

      console.log(`[ReconnectToGame] ✅ ${username} reconnected to ${roomId}`);

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

      console.log(`[RequestGameState] ✅ Sending state to ${userId}`);

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
          console.log(`[Disconnect] Game started, keeping ${username} in game (may reconnect)`);
          socket.leave(roomId);
          gameManager.removeSocketMapping(socket.id);
          
          // Notify others
          io.to(roomId).emit('player_disconnected', { 
            playerId: userId,
            playerName: username 
          });
          
        } else if (game) {
          // ✅ Game NOT started - remove player normally
          console.log(`[Disconnect] Game not started, removing ${username} from game`);
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
    console.log(`[HandlePlayerLeave] Game started, NOT removing player ${userId} (they may reconnect)`);
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
  console.log(`[HandlePlayerLeave] Game not started, removing player ${userId}`);
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