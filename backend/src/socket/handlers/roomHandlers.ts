import { Server } from 'socket.io';
import { Socket } from '../../types/socket.types.js';
import { RoomService } from '../../services/RoomService.js';
import { GameStateManager } from '../../managers/GameStateManager.js';
import { validateCreateRoom, validateJoinRoom } from '../../validators/schemas.js';
import { emitError } from '../../utils/errors.js';

/**
 * Room Handlers: THIN layer between Socket.IO and business logic
 */

export function setupRoomHandlers(
  io: Server,
  socket: Socket,
  roomService: RoomService,
  gameManager: GameStateManager
) {
  
  /**
   * Get all rooms (for lobby)
   */
  socket.on('get_rooms', () => {
    try {
      const roomsList = buildRoomsList(roomService, gameManager);
      socket.emit('rooms_list', roomsList);
    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * Create a new room
   */
  socket.on('create_room', (data) => {
    try {
      const validated = validateCreateRoom(data);

      // Use authenticated user ID and username
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

      gameManager.createGame(roomId);
      
      socket.emit('room_created', { 
        roomId, 
        roomCode: metadata.roomCode 
      });

      broadcastRoomsList(io, roomService, gameManager);

      console.log(`[RoomHandlers] ${socket.data.username} created room ${roomId} (${metadata.roomCode})`);

    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * Join an existing room
   */
  socket.on('join_room', (data) => {
    try {
      const validated = validateJoinRoom(data);
      const { roomId, playerName } = validated;

      if (!socket.data.userId) {
        throw new Error('User not authenticated');
      }

      const userId = socket.data.userId;
      const game = gameManager.getGameOrThrow(roomId);
      const room = roomService.getRoom(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      roomService.canJoinRoom(roomId, game.gameStarted, game.players.length);

      // Add player using userId (this is stored in game state)
      const added = game.addPlayer(userId, playerName);
      if (!added) {
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      // ✅ IMPORTANT: Track socket.id -> roomId mapping for socket events
      socket.join(roomId);
      socket.data.roomId = roomId;
      gameManager.setPlayerRoom(socket.id, roomId); // Maps socket.id -> roomId
      gameManager.resetGameTimer(roomId);

      socket.emit('joined_room', { roomId });
      io.to(roomId).emit('game_state', game.getPublicState());
      io.to(roomId).emit('player_joined', { 
        playerId: userId,
        playerName 
      });

      broadcastRoomsList(io, roomService, gameManager);

      console.log(`[RoomHandlers] ${playerName} (userId: ${userId}, socketId: ${socket.id}) joined room ${roomId}`);

    } catch (error) {
      emitError(socket, error);
    }
  });

  /**
   * Leave current room
   */
  socket.on('leave_room', () => {
    try {
      const roomId = gameManager.getPlayerRoom(socket.id);
      if (!roomId) return;

      handlePlayerLeave(io, socket, roomId, roomService, gameManager);

    } catch (error) {
      emitError(socket, error);
    }
  });
}

// ===== Helper Functions =====

/**
 * Build rooms list for lobby
 */
function buildRoomsList(
  roomService: RoomService,
  gameManager: GameStateManager
): any[] {
  const rooms: any[] = [];

  for (const [roomId, metadata] of roomService.getAllRooms().entries()) {
    const game = gameManager.getGame(roomId);
    if (game) {
      rooms.push(gameManager.buildRoomListItem(roomId, game, metadata));
    }
  }

  return rooms;
}

/**
 * Broadcast rooms list to all connected clients
 */
function broadcastRoomsList(
  io: Server,
  roomService: RoomService,
  gameManager: GameStateManager
): void {
  const roomsList = buildRoomsList(roomService, gameManager);
  io.emit('rooms_list', roomsList);
}

/**
 * Handle player leaving a room
 */
export function handlePlayerLeave(
  io: Server,
  socket: Socket,
  roomId: string,
  roomService: RoomService,
  gameManager: GameStateManager
): void {
  const game = gameManager.getGame(roomId);
  if (!game) return;

  // ✅ FIX: Remove player by userId, not socket.id
  const userId = socket.data.userId;
  if (userId) {
    game.removePlayer(userId);
    console.log(`[RoomHandlers] Player ${userId} (socket: ${socket.id}) left room ${roomId}`);
  }

  // If room is empty, delete everything
  if (game.players.length === 0) {
    gameManager.deleteGame(roomId);
    roomService.deleteRoom(roomId);
    console.log(`[RoomHandlers] Room ${roomId} deleted (empty)`);
  } else {
    // Notify remaining players
    io.to(roomId).emit('player_left', { playerId: userId });
    io.to(roomId).emit('game_state', game.getPublicState());
  }

  // Cleanup socket mappings
  socket.leave(roomId);
  gameManager.removePlayerMapping(socket.id);

  // Broadcast updated room list
  broadcastRoomsList(io, roomService, gameManager);
}